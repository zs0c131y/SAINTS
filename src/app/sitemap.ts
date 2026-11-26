import type { MetadataRoute } from 'next';
import { getTracks } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tracks = await getTracks();
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/abstract`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/registration`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/committee`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ...tracks.map((t) => ({ url: `${SITE_URL}/track/${t.id}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ];
}
