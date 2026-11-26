import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/site';
import './not-found.css';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'Find registration, abstract submission and the conference schedule for SAINTS 2027.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="nf">
      <header className="masthead">
        <div className="frame">
          <a className="brand" href="https://christuniversity.in/" target="_blank" rel="noopener" aria-label="CHRIST (Deemed to be University), opens in a new tab">
            <Image src="/assets/images/logos/christ_main_blue-gold.webp" alt="" width={400} height={128} />
          </a>
          <Link className="brand" href="/" aria-label="SAINTS 2027 home">
            <Image src="/assets/images/logos/saints_main.webp" alt="" width={330} height={128} />
          </Link>
        </div>
      </header>

      <main className="frame layout" aria-labelledby="page-title">
        <div>
          <h1 id="page-title"><span className="code">404</span> Page not found</h1>
          <p className="lead">This link may be out of date, or the address may have been mistyped.</p>
          <Link className="home" href="/"><span aria-hidden="true">&larr;</span> Back to home</Link>
          <nav className="shortcuts" aria-label="Conference links">
            <ul>
              <li><Link href="/registration">Registration <span aria-hidden="true">&rarr;</span></Link></li>
              <li><Link href="/abstract">Submit an abstract <span aria-hidden="true">&rarr;</span></Link></li>
              <li><Link href="/#schedule">Schedule <span aria-hidden="true">&rarr;</span></Link></li>
            </ul>
          </nav>
        </div>

        <figure className="art" aria-hidden="true">
          <Image src="/assets/images/website-assets/404-microscope.webp" width={1000} height={1000} alt="" />
        </figure>
      </main>

      <footer className="frame support">
        <p>Need help? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </footer>
    </div>
  );
}
