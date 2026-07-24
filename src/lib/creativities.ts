import { CreativityFrontmatter, CreativityPost, CreativityPostPreview } from '@/types/creativity';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

const creativityDirectory = path.join(process.cwd(), 'src/data/creativities');

/**
 * Get all creativity post files from the directory
 */
export function getCreativityPostSlugs(): string[] {
  if (!fs.existsSync(creativityDirectory)) {
    return [];
  }

  const files = fs.readdirSync(creativityDirectory);
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

/**
 * Get creativity post by slug with full content
 */
export function getCreativityPostBySlug(slug: string): CreativityPost | null {
  try {
    const fullPath = path.join(creativityDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Validate frontmatter
    const frontmatter = data as CreativityFrontmatter;
    if (!frontmatter.title || !frontmatter.description) {
      throw new Error(`Invalid frontmatter in ${slug}.mdx`);
    }

    return {
      slug,
      frontmatter,
      content,
    };
  } catch (error) {
    console.error(`Error reading creativity post ${slug}:`, error);
    return null;
  }
}

/**
 * Get all creativity posts with frontmatter only (for listing page)
 */
export function getAllCreativityPosts(): CreativityPostPreview[] {
  const slugs = getCreativityPostSlugs();

  const posts = slugs
    .map((slug) => {
      const post = getCreativityPostBySlug(slug);
      if (!post) return null;

      return {
        slug: post.slug,
        frontmatter: post.frontmatter,
      };
    })
    .filter((post): post is CreativityPostPreview => post !== null)
    .sort((a, b) => {
      // Sort by date, newest first
      return (
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
      );
    });

  return posts;
}

/**
 * Get all published creativity posts
 */
export function getPublishedCreativityPosts(): CreativityPostPreview[] {
  const allPosts = getAllCreativityPosts();
  return allPosts.filter((post) => post.frontmatter.isPublished);
}

/**
 * Get creativity posts by tag
 */
export function getCreativityPostsByTag(tag: string): CreativityPostPreview[] {
  const publishedPosts = getPublishedCreativityPosts();
  return publishedPosts.filter((post) =>
    post.frontmatter.tags.some(
      (postTag) => postTag.toLowerCase() === tag.toLowerCase(),
    ),
  );
}

/**
 * Get all unique tags from published posts
 */
export function getAllCreativityTags(): string[] {
  const publishedPosts = getPublishedCreativityPosts();
  const tagsSet = new Set<string>();

  publishedPosts.forEach((post) => {
    post.frontmatter.tags.forEach((tag) => {
      tagsSet.add(tag.toLowerCase());
    });
  });

  return Array.from(tagsSet).sort();
}

/**
 * Get related posts based on tags (excluding the current post)
 */
export async function getRelatedCreativityPosts(
  currentSlug: string,
  maxPosts = 3,
): Promise<CreativityPostPreview[]> {
  const currentPost = await getCreativityPostBySlug(currentSlug);
  if (!currentPost || !currentPost.frontmatter.isPublished) {
    return [];
  }

  const allPosts = getPublishedCreativityPosts();
  const currentTags = currentPost.frontmatter.tags.map((tag) =>
    tag.toLowerCase(),
  );

  // Calculate relevance score based on shared tags
  const postsWithScore = allPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      const sharedTags = post.frontmatter.tags.filter((tag) =>
        currentTags.includes(tag.toLowerCase()),
      );
      return {
        post,
        score: sharedTags.length,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return postsWithScore.slice(0, maxPosts).map((item) => item.post);
}
