import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevealObserver from '@/components/RevealObserver';
import { dateText, getConferenceRange, getTracks } from '@/lib/content';
import { CONTACT_EMAIL } from '@/lib/site';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "6–8 Jan 2027" for the compact phone/tablet nav. */
function shortRange(range: { start: Date; end: Date } | null): string {
  if (!range) return '6–8 Jan 2027';
  const { start: s, end: e } = range;
  if (+s === +e) return `${s.getDate()} ${MON[s.getMonth()]} ${s.getFullYear()}`;
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) return `${s.getDate()}–${e.getDate()} ${MON[e.getMonth()]} ${e.getFullYear()}`;
  return `${s.getDate()} ${MON[s.getMonth()]} – ${e.getDate()} ${MON[e.getMonth()]} ${e.getFullYear()}`;
}

/** Everything except the 404 page: header, footer and scroll-reveal. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [tracks, range, abstractDeadline, conferenceDates] = await Promise.all([
    getTracks(), getConferenceRange(), dateText('Abstract Deadline', '25 November 2026'), dateText('Conference Dates', '6–8 January 2027'),
  ]);

  return (
    <>
      <Header
        tracks={tracks.map(({ id, title, theme }) => ({ id, title, theme }))}
        abstractDeadline={abstractDeadline}
        conferenceDates={conferenceDates}
        metaDates={shortRange(range)}
        contactEmail={CONTACT_EMAIL}
      />
      <main>{children}</main>
      <Footer />
      <RevealObserver />
    </>
  );
}
