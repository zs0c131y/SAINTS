import type { CSSProperties } from 'react';

/** Font Awesome subset icon (CSS mask, see styles/fa-subset.css). `icon` is e.g. "fa-solid fa-arrow-right". */
export function Fa({ icon, className }: { icon: string; className?: string }) {
  return <i className={className ? `${icon} ${className}` : icon} aria-hidden="true" />;
}

/** Stagger for the scroll-reveal animation. */
export const delay = (ms: number): CSSProperties => ({ ['--d' as string]: `${ms}ms` });

/** Sheet-supplied images come from arbitrary hosts, so they use a plain <img> instead of next/image. */
export function SheetImg({ src, alt = '', className }: { src: string; alt?: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />;
}
