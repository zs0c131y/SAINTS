import Image from 'next/image';
import Link from 'next/link';
import { Fa } from './ui';
import { CONTACT_EMAIL, SCHOOL_URL, SOCIALS, VENUE_MAP } from '@/lib/site';
import { dateText, fillOptions, getFaqs, getOptions, getPlaces } from '@/lib/content';
import { sanitize } from '@/lib/sanitize';

export default async function Footer() {
  const [options, conferenceDates, places, faqs] = await Promise.all([
    getOptions(),
    dateText('Conference Dates', '6–8 January 2027'),
    getPlaces(),
    getFaqs(),
  ]);
  const footerText = options.footer_text ? sanitize(fillOptions(options.footer_text, options)) : '';

  return (
    <footer className="bg-primary-950 text-white/70 text-sm">
      <div className="container mx-auto grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <a href="https://christuniversity.in/" target="_blank" rel="noopener" className="logo-link" aria-label="CHRIST (Deemed to be University), opens in a new tab">
            <Image src="/assets/images/logos/CULOGO25_White.webp" width={331} height={112} alt="CHRIST (Deemed to be University)" className="h-14 w-auto mb-5" />
          </a>
          <p className="max-w-sm leading-relaxed">
            SAINTS 2027, the International Conference on Scientific Advances in Natural &amp; Technological Sciences, is organised by the{' '}
            <a href={SCHOOL_URL} target="_blank" rel="noopener" className="inline-link">School of Sciences</a>.
          </p>

          <p className="foot-h mt-8">Follow CHRIST (Deemed to be University)</p>
          <ul className="socials">
            {SOCIALS.map((s) => (
              <li key={s.label}><a href={s.href} target="_blank" rel="noopener" aria-label={s.label}><Fa icon={s.icon} /></a></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="foot-h">Conference</p>
          <ul className="space-y-2.5">
            <li><Link href="/#about" className="foot-a">About</Link></li>
            <li><Link href="/#speakers" className="foot-a">Tracks &amp; speakers</Link></li>
            <li><Link href="/#schedule" className="foot-a">Schedule</Link></li>
            <li><Link href="/#gallery" className="foot-a">Gallery</Link></li>
            <li><Link href="/registration" className="foot-a">Registration &amp; fees</Link></li>
            <li><Link href="/committee" className="foot-a">Organizing committee</Link></li>
            {places.length > 0 && <li><Link href="/#visit" className="foot-a">Places to visit</Link></li>}
            {faqs.length > 0 && <li><Link href="/#faq" className="foot-a">FAQs</Link></li>}
          </ul>
        </div>

        <div>
          <p className="foot-h">Venue</p>
          <a href={VENUE_MAP} target="_blank" rel="noopener" className="foot-a leading-relaxed block">
            CHRIST (Deemed to be University),<br />Bangalore, India <Fa icon="fa-solid fa-arrow-up-right-from-square" className="text-[10px] ml-1" />
          </a>
          <p className="mt-3">{conferenceDates}</p>

          <p className="foot-h mt-8">Contact</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="foot-a">{CONTACT_EMAIL}</a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto py-5 text-xs text-white/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {footerText
            ? <span dangerouslySetInnerHTML={{ __html: footerText }} />
            : <span>&copy; 2027 SAINTS Organizing Committee. All rights reserved.</span>}
          <span>
            Designed &amp; developed by{' '}
            <a href="https://adarshg.dev" target="_blank" rel="noopener" className="credit">Adarsh Gupta</a> and{' '}
            <a href="https://abhinavjain.dev" target="_blank" rel="noopener" className="credit">Abhinav Jain</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
