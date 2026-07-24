import { BlogPostPreview } from '@/types/blog';

import { BlogCard } from './BlogCard';

interface BlogListProps {
  posts: BlogPostPreview[];
  className?: string;
}

export function BlogList({ posts, className = '' }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-2xl font-semibold">No blog posts found</h2>
        <p className="text-muted-foreground">
          Check back later for new content!
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
