'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const KEY = 'splash';
const MIN_MS = 900;   // show the logos at least this long
const MAX_MS = 3000;  // never hold the page longer than this

/**
 * Once-per-session logo splash for the home page. The inline script in the root layout adds
 * `splash-on` to <html> before first paint when it has not been seen this session, so there is
 * no flash of the page underneath.
 */
export default function Splash() {
  const [gone, setGone] = useState(false);
  const [out, setOut] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('splash-on')) return;   // seen this session: CSS keeps #splash hidden

    const t0 = Date.now();
    let done = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const hide = () => {
      if (done) return;
      done = true;
      setOut(true);
      try { sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked */ }
      timers.push(setTimeout(() => { setGone(true); root.classList.remove('splash-on'); }, 500));
    };
    const go = () => timers.push(setTimeout(hide, Math.max(0, MIN_MS - (Date.now() - t0))));

    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    timers.push(setTimeout(hide, MAX_MS));
    return () => { timers.forEach(clearTimeout); window.removeEventListener('load', go); };
  }, []);

  if (gone) return null;
  return (
    <div id="splash" className={out ? 'splash-out' : undefined} aria-hidden="true">
      <div className="splash-inner">
        <Image src="/assets/images/logos/christ_main_blue-gold.webp" width={400} height={128} alt="" className="splash-logo" />
        <span className="splash-rule" />
        <Image src="/assets/images/logos/saints_main.webp" width={330} height={128} alt="" className="splash-logo" />
      </div>
    </div>
  );
}
