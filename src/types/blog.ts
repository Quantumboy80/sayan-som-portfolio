export interface BlogFrontmatter {
  title: string;
  description: string;
  image: string;
  video?: string;
  tags: string[];
  date: string;
  isPublished: boolean;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
}

export interface BlogPostPreview {
  slug: string;
  frontmatter: BlogFrontmatter;
}
