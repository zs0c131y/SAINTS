'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import './not-found.css';

/** Shown if a page throws while rendering. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="nf">
      <main className="frame layout" aria-labelledby="page-title">
        <div>
          <h1 id="page-title"><span className="code">Oops</span> Something went wrong</h1>
          <p className="lead">The page could not be loaded. Please try again in a moment.</p>
          <button type="button" className="home" onClick={reset}>Try again</button>
          <nav className="shortcuts" aria-label="Conference links">
            <ul>
              <li><Link href="/">Back to home <span aria-hidden="true">&rarr;</span></Link></li>
            </ul>
          </nav>
        </div>
      </main>
    </div>
  );
}
