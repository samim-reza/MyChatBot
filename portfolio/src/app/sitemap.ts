import { siteConfig } from '@/config/Meta';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const routes: Array<{ path: string; priority: number }> = [
  { path: '/', priority: 1 },
  { path: '/work-experience/', priority: 0.9 },
  { path: '/projects/', priority: 0.9 },
  { path: '/blog/', priority: 0.8 },
  { path: '/journey/', priority: 0.7 },
  { path: '/journey/certificates/', priority: 0.6 },
  { path: '/resume/', priority: 0.8 },
  { path: '/contact/', priority: 0.8 },
  { path: '/setup/', priority: 0.5 },
  { path: '/gears/', priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority,
  }));
}
