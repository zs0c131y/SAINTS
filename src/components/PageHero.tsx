import Image from 'next/image';
import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { delay } from './ui';

/** Hero art shared by the home page and the inner-page heroes. */
export function HeroBackdrop() {
  return (
    <>
      <Image
        src="/assets/images/website-assets/hero-section-1280.webp"
        alt="" width={1920} height={1200} priority fetchPriority="high" sizes="100vw"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 hero-tint" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-500" />
    </>
  );
}

export interface Crumb { label: string; href?: string }

interface Props {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
  /** Animate the hero text in (registration / abstract pages). */
  reveal?: boolean;
}

/** Inner-page hero: breadcrumb, eyebrow, title, optional lead and action buttons. */
export default function PageHero({ crumbs, eyebrow, title, lead, actions, reveal }: Props) {
  const r = (ms: number) => (reveal ? { 'data-reveal': '', style: delay(ms) } : {});
  return (
    <section id="page-hero" className="relative overflow-hidden bg-primary-950 text-white">
      <HeroBackdrop />
      <div className="relative z-10 container mx-auto">
        <nav className="crumbs" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <Fragment key={c.label}>
              {i > 0 && <span>/</span>}
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
            </Fragment>
          ))}
        </nav>
        <p className="eyebrow eyebrow-light mt-6" {...(reveal ? { 'data-reveal': '' } : {})}>{eyebrow}</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mt-4 mb-4" {...r(80)}>{title}</h1>
        {lead && <p className="text-white/80 text-lg max-w-3xl mb-8" {...r(160)}>{lead}</p>}
        {actions && <div className="flex flex-col sm:flex-row gap-3" {...r(240)}>{actions}</div>}
      </div>
    </section>
  );
}
