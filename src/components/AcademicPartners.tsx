'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Logo } from '@/data/partners';

const COLLAPSED = 364;   // px; keep in sync with .pub-academic.is-collapsed in main.css
const DURATION = 550;

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** Academic partner logos: about three rows, expandable with a smooth height transition. */
export default function AcademicPartners({ logos }: { logos: Logo[] }) {
  const gridRef = useRef<HTMLUListElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const grid = gridRef.current;
    const btn = btnRef.current;
    if (!grid || !btn) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    grid.classList.add('is-anim', 'is-collapsed');
    setReady(true);

    /* Animate grid height and button margin together (same timing both ways). */
    const animate = (h0: number, h1: number, m0: number, m1: number, endTop: number | null, startTop: number) => {
      let t0: number | null = null;
      grid.style.transitionProperty = '--pub-fade';
      btn.style.transition = 'none';
      grid.style.maxHeight = `${h0}px`;
      btn.style.marginTop = `${m0}px`;
      const done = () => {
        grid.style.maxHeight = grid.classList.contains('is-collapsed') ? '' : 'none';
        btn.style.marginTop = '';
        btn.style.transition = '';
        grid.style.transitionProperty = '';
      };
      if (still) { done(); return; }
      const frame = (ts: number) => {
        if (t0 === null) t0 = ts;
        const p = Math.min((ts - t0) / DURATION, 1);
        const e = ease(p);
        grid.style.maxHeight = `${h0 + (h1 - h0) * e}px`;
        btn.style.marginTop = `${m0 + (m1 - m0) * e}px`;
        if (endTop !== null) {
          // keep the button gliding to a fixed spot; the page has scroll-behavior:smooth, so force instant
          window.scrollBy({ top: btn.getBoundingClientRect().top - (startTop + (endTop - startTop) * e), behavior: 'instant' });
        }
        if (p < 1) raf = requestAnimationFrame(frame); else done();
      };
      raf = requestAnimationFrame(frame);
    };

    const onClick = () => {
      const opening = grid.classList.contains('is-collapsed');
      setOpen(opening);
      const h0 = grid.offsetHeight;
      const m0 = parseFloat(getComputedStyle(btn).marginTop);
      if (opening) {
        const full = grid.scrollHeight;
        grid.style.maxHeight = `${h0}px`;   // pin the size so toggling the class doesn't shift layout before frame 1
        grid.classList.remove('is-collapsed');
        animate(h0, full, m0, 20, null, 0);
        return;
      }
      const startTop = btn.getBoundingClientRect().top;
      const finishTop = startTop - (h0 - COLLAPSED) - (m0 + 18);
      // keep the button's spot if it would still be on screen, otherwise bring it to ~60% down
      const want = window.innerHeight * 0.6;
      const endTop = finishTop > 40 && finishTop < window.innerHeight - 60 ? finishTop : want;
      grid.style.maxHeight = `${h0}px`;
      btn.style.marginTop = `${m0}px`;
      grid.classList.add('is-collapsed');
      if (still) window.scrollBy({ top: finishTop - want, behavior: 'instant' });
      animate(h0, COLLAPSED, m0, -18, endTop, startTop);
    };

    btn.addEventListener('click', onClick);
    return () => {
      btn.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
      grid.classList.remove('is-anim', 'is-collapsed');
      grid.style.maxHeight = '';
    };
  }, []);

  return (
    <>
      <ul className="pub-grid pub-academic" id="pub-academic-grid" ref={gridRef}>
        {logos.map((l) => (
          <li key={l.src}>
            <figure className="pub-card">
              <div className="pub-img">
                <Image src={l.src} width={l.width} height={l.height} alt={l.alt} sizes="(min-width: 1024px) 200px, 40vw" loading="lazy" />
              </div>
            </figure>
          </li>
        ))}
      </ul>
      <button type="button" className="pub-more" hidden={!ready} aria-expanded={open} aria-controls="pub-academic-grid" ref={btnRef}>
        {open ? 'Show fewer' : 'Show all partners'}
      </button>
    </>
  );
}
