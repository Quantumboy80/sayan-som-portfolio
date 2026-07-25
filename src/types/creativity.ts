export interface CreativityFrontmatter {
  title: string;
  description: string;
  image: string;
  video?: string;
  tags: string[];
  date: string;
  isPublished: boolean;
}

export interface CreativityPost {
  slug: string;
  frontmatter: CreativityFrontmatter;
  content: string;
}

export interface CreativityPostPreview {
  slug: string;
  frontmatter: CreativityFrontmatter;
}
