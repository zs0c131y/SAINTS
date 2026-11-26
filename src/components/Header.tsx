'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Fa } from './ui';
import { LEGACY_EDITIONS } from '@/lib/site';

export interface HeaderProps {
  tracks: { id: string; title: string; theme: string }[];
  abstractDeadline: string;
  conferenceDates: string;
  /** Short label for the phone/tablet nav, e.g. "6–8 Jan 2027". */
  metaDates: string;
  contactEmail: string;
}

// Scroll behaviour: collapse the logo row on scroll-down, restore on scroll-up (hysteresis stops flicker).
const COLLAPSE_AT = 16;
const DOWN_DISTANCE = 3;
const UP_DISTANCE = 28;

const SECTION_LINKS: Record<string, string> = { hero: '/', about: '/#about', publications: '/#publications', schedule: '/#schedule', gallery: '/#gallery' };

export default function Header({ tracks, abstractDeadline, conferenceDates, metaDates, contactEmail }: HeaderProps) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const topbarRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const collapsedRef = useRef(false);

  // the menu is open for the page it was opened on, so it closes by itself after navigating
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const setMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null);
  const [accordion, setAccordion] = useState<string | null>(null);
  const [sectionLink, setSectionLink] = useState('/');

  /* Which nav link is current: the page we are on, or (on the home page) the section in view. */
  const activeHref = pathname === '/' ? sectionLink : pathname;

  /* 1. Measure the header (never during scroll): the hero is padded by its full height. */
  const measure = useCallback(() => {
    const top = topRef.current;
    const nav = navRef.current;
    if (!top || !nav) return;
    const collapse = top.offsetHeight;
    document.documentElement.style.setProperty('--collapse-y', `${collapse}px`);
    const hero = document.getElementById('hero') ?? document.getElementById('page-hero');
    if (hero) hero.style.paddingTop = `${collapse + nav.offsetHeight}px`;
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    const ro = 'ResizeObserver' in window && topRef.current ? new ResizeObserver(measure) : null;
    if (ro && topRef.current) ro.observe(topRef.current);
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('load', measure); ro?.disconnect(); };
  }, [measure, pathname]);

  /* 2. Scroll: one rAF-batched, transform-only update. */
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let lastY = window.scrollY;
    let travelled = 0;
    let ticking = false;
    let maxScroll = 1;

    const calcMax = () => { maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); };
    const setCollapsed = (v: boolean) => {
      if (v === collapsedRef.current) return;
      collapsedRef.current = v;
      header.classList.toggle('is-collapsed', v);
    };
    const frame = () => {
      ticking = false;
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.min(1, y / maxScroll)})`;
      if (y <= 8) { setCollapsed(false); travelled = 0; }
      else if (dy !== 0) {
        if ((dy > 0) !== (travelled > 0)) travelled = 0;
        travelled += dy;
        if (travelled > DOWN_DISTANCE && y > COLLAPSE_AT) setCollapsed(true);
        else if (travelled < -UP_DISTANCE) setCollapsed(false);
      }
      lastY = y;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };

    calcMax();
    frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', calcMax);
    window.addEventListener('load', calcMax);
    // page height changes with every route
    const t = setTimeout(calcMax, 400);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', calcMax);
      window.removeEventListener('load', calcMax);
      clearTimeout(t);
    };
  }, [pathname]);

  /* 3. Home page: highlight the nav link of the section in view, and keep the URL free of #fragments. */
  useEffect(() => {
    if (pathname !== '/') return;

    const clearHash = () => {
      if (!location.hash || !document.getElementById(location.hash.slice(1))) return;
      history.replaceState(history.state, '', '/' + location.search);
    };
    const raf = requestAnimationFrame(clearHash);
    window.addEventListener('hashchange', clearHash);

    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const link = SECTION_LINKS[entry.target.id];
          if (link) setSectionLink(link);
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      document.querySelectorAll('section[id]').forEach((s) => io!.observe(s));
    }
    return () => { cancelAnimationFrame(raf); window.removeEventListener('hashchange', clearHash); io?.disconnect(); };
  }, [pathname]);

  /* Topbar dismiss: animate the height to 0, then re-measure. */
  const closeTopbar = () => {
    const bar = topbarRef.current;
    if (!bar) return;
    bar.style.height = `${bar.offsetHeight}px`;
    void bar.offsetHeight;
    bar.classList.add('is-closed');
    bar.style.height = '0px';
    bar.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'height') { bar.style.display = 'none'; measure(); }
    });
  };

  /* Desktop dropdowns open on hover/focus; close them once a link is chosen. */
  const dropdownClick = (e: React.MouseEvent<HTMLLIElement>) => {
    if (!(e.target as HTMLElement).closest('.dropdown-menu a')) return;
    const item = e.currentTarget;
    item.classList.add('is-closed');
    if (document.activeElement && item.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
  };
  const dropdownLeave = (e: React.MouseEvent<HTMLLIElement>) => {
    const item = e.currentTarget;
    item.classList.remove('is-closed');
    if (document.activeElement && item.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
  };

  const navLink = (href: string, label: string) => (
    <li key={href}>
      <Link href={href} className={`nav-link${activeHref === href ? ' active' : ''}`}>{label}</Link>
    </li>
  );

  return (
    <>
      <div id="scroll-progress" ref={progressRef} aria-hidden="true" />

      <header id="main-header" ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
        {/* Slides away on scroll: topbar + logo row */}
        <div id="header-top" ref={topRef}>
          <div id="topbar" ref={topbarRef} className="topbar">
            <div className="topbar-inner container mx-auto flex items-center gap-3">
              <span className="topbar-badge"><span className="topbar-pulse" /> Updates</span>

              <div className="ticker-mask flex-1 overflow-hidden relative">
                <div className="ticker-track inline-flex items-center gap-12">
                  <span><strong>Abstract submission is open.</strong> Submit by <strong>{abstractDeadline}</strong>.</span>
                  <span><strong>Plenary speakers announced</strong> for all four tracks.</span>
                  <span><strong>Conference dates:</strong> <span>{conferenceDates}</span>, CHRIST (Deemed to be University), Bangalore</span>
                  <span><strong>Best Paper Awards</strong> across all four tracks.</span>
                </div>
              </div>

              <button id="topbar-close" aria-label="Close announcements bar" className="topbar-close" onClick={closeTopbar}>
                <Fa icon="fa-solid fa-xmark" className="text-xs" />
              </button>
            </div>
          </div>

          <div id="top-header" className="top-header">
            <div className="container mx-auto py-3 flex items-center justify-between gap-4 sm:gap-6">
              <a href="https://christuniversity.in/" target="_blank" rel="noopener" className="logo-link" aria-label="CHRIST (Deemed to be University), opens in a new tab">
                <Image src="/assets/images/logos/christ_main_blue-gold.webp" width={400} height={128} alt="CHRIST (Deemed to be University)" className="h-12 sm:h-16 w-auto object-contain" priority />
              </a>
              <Link href="/" className="logo-link" aria-label="SAINTS 2027 home">
                <Image src="/assets/images/logos/saints_main.webp" width={330} height={128} alt="SAINTS 2027 Logo" className="h-12 sm:h-16 w-auto object-contain" priority />
              </Link>
              <div className="sponsor-chip">
                <span className="sponsor-label"><Fa icon="fa-solid fa-medal" /> Gold Sponsor</span>
                <Image src="/assets/images/logos/rsi-supports-research-gold-sponsor.webp" width={113} height={112} alt="RSI Supports Research — Gold Sponsor" className="h-10 sm:h-14 w-auto object-contain" priority />
              </div>
            </div>
          </div>
        </div>

        {/* Navbar (always visible) */}
        <nav id="navbar" ref={navRef} className="navbar" aria-label="Primary">
          <div className="container mx-auto flex items-center justify-between h-16">
            <Link href="/" className="nav-brand" aria-label="SAINTS 2027 home">
              <Image src="/assets/images/logos/saints_main.webp" width={330} height={128} alt="SAINTS 2027" className="h-9 w-auto object-contain" />
            </Link>

            <span className="nav-meta"><b>SAINTS 2027</b><span>{metaDates} &middot; Bangalore</span></span>

            <ul className="nav-list hidden lg:flex items-center gap-1 text-sm font-medium">
              {navLink('/', 'Home')}
              {navLink('/#about', 'About')}

              <li className="nav-item relative" onClick={dropdownClick} onMouseLeave={dropdownLeave}>
                <button className="nav-link" aria-haspopup="true">Speakers <Fa icon="fa-solid fa-chevron-down" className="chev" /></button>
                <ul className="dropdown-menu">
                  {tracks.map((t) => (
                    <li key={t.id}>
                      <Link href={`/track/${t.id}`} className="dropdown-link">
                        <span className="track-num">{t.id}</span>
                        <span className="dd-text"><b>{t.title}</b>{t.theme && <small>{t.theme}</small>}</span>
                        <Fa icon="fa-solid fa-arrow-right" className="dd-arrow" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {navLink('/registration', 'Registration')}
              {navLink('/#publications', 'Publications')}
              {navLink('/#schedule', 'Schedule')}
              {navLink('/#gallery', 'Gallery')}
              {navLink('/committee', 'Committee')}

              <li className="nav-item relative" onClick={dropdownClick} onMouseLeave={dropdownLeave}>
                <button className="nav-link" aria-haspopup="true">Legacy <Fa icon="fa-solid fa-chevron-down" className="chev" /></button>
                <ul className="dropdown-menu">
                  {LEGACY_EDITIONS.map((e) => (
                    <li key={e.label}>
                      <a href={e.href} target="_blank" rel="noopener" className="dropdown-link">
                        <span className="track-num"><Fa icon="fa-regular fa-calendar" /></span>
                        <span className="dd-text"><b>{e.label}</b></span>
                        <Fa icon="fa-solid fa-arrow-up-right-from-square" className="dd-arrow" />
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto lg:ml-0">
              <Link href="/abstract" className="btn btn-primary nav-cta">
                <span>Submit<span className="hidden sm:inline">&nbsp;Abstract</span></span> <Fa icon="fa-solid fa-arrow-right" className="btn-arrow" />
              </Link>
              <button
                id="mobile-menu-btn" className="hamburger lg:hidden" aria-label="Toggle navigation menu"
                aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="hamburger-line" /><span className="hamburger-line" /><span className="hamburger-line" />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div id="mobile-menu" className={`lg:hidden${menuOpen ? ' open' : ''}`}>
            <div className="mobile-menu-inner" onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setMenuOpen(false); }}>
              <ul className="container mx-auto py-3 flex flex-col gap-1 text-sm font-medium">
                <li><Link href="/" className="m-link">Home</Link></li>
                <li><Link href="/#about" className="m-link">About</Link></li>
                <li>
                  <button
                    className="mobile-accordion-btn m-link w-full flex items-center justify-between"
                    aria-expanded={accordion === 'speakers'} onClick={() => setAccordion(accordion === 'speakers' ? null : 'speakers')}
                  >
                    Speakers <Fa icon="fa-solid fa-chevron-down" className="text-xs" />
                  </button>
                  <div id="mobile-speakers" className={`mobile-submenu${accordion === 'speakers' ? ' open' : ''}`}>
                    <ul>
                      {tracks.map((t) => (
                        <li key={t.id}><Link href={`/track/${t.id}`} className="m-sublink">{t.title}{t.theme ? `: ${t.theme}` : ''}</Link></li>
                      ))}
                    </ul>
                  </div>
                </li>
                <li><Link href="/registration" className="m-link">Registration</Link></li>
                <li><Link href="/#publications" className="m-link">Publications</Link></li>
                <li><Link href="/#schedule" className="m-link">Schedule</Link></li>
                <li><Link href="/#gallery" className="m-link">Gallery</Link></li>
                <li><Link href="/committee" className="m-link">Committee</Link></li>
                <li>
                  <button
                    className="mobile-accordion-btn m-link w-full flex items-center justify-between"
                    aria-expanded={accordion === 'legacy'} onClick={() => setAccordion(accordion === 'legacy' ? null : 'legacy')}
                  >
                    Legacy <Fa icon="fa-solid fa-chevron-down" className="text-xs" />
                  </button>
                  <div id="mobile-legacy" className={`mobile-submenu${accordion === 'legacy' ? ' open' : ''}`}>
                    <ul>
                      {LEGACY_EDITIONS.map((e) => (
                        <li key={e.label}><a href={e.href} target="_blank" rel="noopener" className="m-sublink">{e.label}</a></li>
                      ))}
                    </ul>
                  </div>
                </li>
                <li className="m-cta">
                  <Link href="/abstract" className="btn btn-primary justify-center">Submit Abstract <Fa icon="fa-solid fa-arrow-right" className="btn-arrow" /></Link>
                  <Link href="/registration" className="btn btn-ghost justify-center">Register</Link>
                </li>
                <li className="m-contact"><a href={`mailto:${contactEmail}`}><Fa icon="fa-regular fa-envelope" /> {contactEmail}</a></li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
