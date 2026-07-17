import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { siteConfig } from '@/config/Meta';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  // Base list of static routes
  const staticRoutes = [
    '',
    '/work-experience',
    '/certificates',
    '/projects',
    '/techs',
    '/achievements',
    '/hobbies',
    '/blog',
    '/resume',
    '/gears',
    '/setup',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic projects routes
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projectsDir = path.join(process.cwd(), 'src/data/projects');
    if (fs.existsSync(projectsDir)) {
      const files = fs.readdirSync(projectsDir);
      projectRoutes = files
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => {
          const slug = file.replace('.mdx', '');
          return {
            url: `${baseUrl}/projects/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
          };
        });
    }
  } catch (error) {
    console.error('Error reading projects for sitemap:', error);
  }

  // Dynamic blog routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogDir = path.join(process.cwd(), 'src/data/blog');
    if (fs.existsSync(blogDir)) {
      const files = fs.readdirSync(blogDir);
      blogRoutes = files
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => {
          const slug = file.replace('.mdx', '');
          return {
            url: `${baseUrl}/blog/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
          };
        });
    }
  } catch (error) {
    console.error('Error reading blogs for sitemap:', error);
  }

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
