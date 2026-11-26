/** Static facts about the site. Anything editable by the organisers lives in the Google Sheet instead. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://saints.christuniversity.in').replace(/\/$/, '');
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-WCSXFZ7L';

export const SITE_NAME = 'SAINTS 2027';
export const SITE_TITLE = 'SAINTS 2027 - Discovery to Scalable Solutions';
export const SITE_DESCRIPTION =
  'International Conference on Scientific Advances in Natural & Technological Sciences, hosted by the School of Sciences at CHRIST (Deemed to be University), Bangalore.';
export const OG_IMAGE = `${SITE_URL}/assets/images/og-image.jpg`;
export const CONTACT_EMAIL = 'saints@christuniversity.in';
export const VENUE_MAP = 'https://maps.app.goo.gl/uuUKjwd8Y8pchqi28';
export const SCHOOL_URL = 'https://christuniversity.in/schools/school-of-sciences';
export const ABSTRACT_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSf207lI_9zFKQfLKKWXpFzejVC5bueGQAr0FRWA_wTylmuWuA/viewform';
export const REGISTRATION_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSd4qhKBjIjw-vKt0V4oK5km3HZRzxxwqB7r_67W3oZAM35wug/viewform';

/** Fallback CDN assets used until the sheet supplies its own. */
export const FAVICON_32 = 'https://res.cloudinary.com/dchqvsa57/image/upload/v1780542921/favicon-32x32_qu1mkw.png';
export const APPLE_TOUCH_ICON = 'https://res.cloudinary.com/dchqvsa57/image/upload/v1780542921/apple-touch-icon_h6gowb.png';
export const HERO_LOGO = 'https://res.cloudinary.com/dchqvsa57/image/upload/f_auto,q_auto,c_limit,w_840/v1780714581/saints_new_logo_lruoy4.png';

export const LEGACY_EDITIONS = [
  { label: 'SAINTS 2026', href: 'https://sites.google.com/christuniversity.in/saints/home?pli=1&authuser=0' },
  { label: 'SAINTS 2024', href: 'https://sites.google.com/christuniversity.in/saints-2024/home' },
];

export const SOCIALS = [
  { label: 'Blog', href: 'https://christbangalore.blogspot.com/', icon: 'fa-brands fa-blogger-b' },
  { label: 'YouTube', href: 'https://www.youtube.com/thechristuniversity', icon: 'fa-brands fa-youtube' },
  { label: 'Facebook', href: 'https://www.facebook.com/www.christuniversity.in/', icon: 'fa-brands fa-facebook-f' },
  { label: 'Instagram', href: 'https://www.instagram.com/christ_university_bangalore/', icon: 'fa-brands fa-instagram' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/school/christ-university-bangalore/posts/', icon: 'fa-brands fa-linkedin-in' },
  { label: 'X', href: 'https://x.com/christbangalore', icon: 'fa-brands fa-x-twitter' },
];

/** Photos served from this site until they are uploaded to Cloudinary. A photo set in the sheet is tried first. */
export const LOCAL_SPEAKER_PHOTOS: [RegExp, string][] = [
  [/ribeiro/i, '/assets/images/speakers/vinay-j-ribeiro.jpg'],
  [/maidin/i, '/assets/images/speakers/siti-sarah-maidin.jpg'],
  [/rathore/i, '/assets/images/speakers/vijay-singh-rathore.jpg'],
  [/sprick/i, '/assets/images/speakers/barbara-sprick.jpg'],
];
