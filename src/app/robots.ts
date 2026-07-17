import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/Meta';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/api/', '/api'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
