import type { Metadata } from 'next';
import { OG_IMAGE, SITE_NAME, SITE_TITLE } from './site';

/** Title, description, canonical and social tags for an inner page. `path` is relative to the site root. */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const full = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: full, description, url: path, type: 'website', siteName: SITE_NAME, locale: 'en_IN',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_TITLE }],
    },
    twitter: { card: 'summary_large_image', title: full, description, images: [OG_IMAGE] },
  };
}
