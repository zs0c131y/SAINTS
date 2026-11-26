import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { getOptions, realValue } from '@/lib/content';
import { isHttp } from '@/lib/format';
import { APPLE_TOUCH_ICON, FAVICON_32, GTM_ID, OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site';

import './globals.css';

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#081330' };

export async function generateMetadata(): Promise<Metadata> {
  const o = await getOptions();
  const icon32 = isHttp(o.favicon_32x32) ? o.favicon_32x32 : FAVICON_32;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    authors: [{ name: 'SAINTS 2027 Organizing Committee' }],
    robots: { index: true, follow: true },
    icons: {
      icon: [
        { url: icon32, sizes: '32x32', type: 'image/png' },
        ...(isHttp(o.favicon_16x16) ? [{ url: o.favicon_16x16, sizes: '16x16', type: 'image/png' }] : []),
      ],
      apple: isHttp(o.apple_touch_icon) ? o.apple_touch_icon : APPLE_TOUCH_ICON,
    },
    manifest: isHttp(o.favicon_manifest) ? o.favicon_manifest : undefined,
    verification: {
      google: realValue(o.google_site_verification) ? o.google_site_verification : undefined,
      other: realValue(o.bing_site_verification) ? { 'msvalidate.01': o.bing_site_verification } : undefined,
    },
    openGraph: {
      type: 'website', siteName: SITE_NAME, locale: 'en_IN',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_TITLE }],
    },
    twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
  };
}

/** Runs before first paint: flags the home page for the once-per-session splash. */
const SPLASH_FLAG = `try{if(location.pathname==='/'&&!sessionStorage.getItem('splash'))document.documentElement.classList.add('splash-on')}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preload" href="/assets/fonts/inter-latin-1.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/fonts/newsreader-latin-3.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: SPLASH_FLAG }} />
        {/* Without JavaScript the scroll-reveal sections would stay invisible. */}
        <noscript><style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style></noscript>
      </head>
      <body className="font-sans bg-white text-gray-800 antialiased">
        {GTM_ID && (
          <>
            <noscript>
              <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" />
            </noscript>
            <Script id="gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
