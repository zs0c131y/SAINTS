import type { Metadata } from 'next';
import Link from 'next/link';
import D from '@/components/D';
import { Fa, SheetImg, delay } from '@/components/ui';
import { HeroBackdrop } from '@/components/PageHero';
import Countdown from '@/components/Countdown';
import Splash from '@/components/Splash';
import PartnersSection from '@/components/PartnersSection';
import TrackCard from '@/components/TrackCard';
import WelcomeMessage from '@/components/WelcomeMessage';
import Collapsible from '@/components/Collapsible';
import {
  fillOptions, getConferenceRange, getFaqs, getGallery, getOptions, getPlaces, getSpeakers,
  getTimeline, getTracks, getWelcomeMessages, realValue,
} from '@/lib/content';
import { fmtDate, isHttp, numberWord, pad2, sized } from '@/lib/format';
import { richText, sanitize } from '@/lib/sanitize';
import { HERO_LOGO, OG_IMAGE, SCHOOL_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, VENUE_MAP } from '@/lib/site';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

export const revalidate = 60;

/** The sheet's site-wide SEO values apply to the home page; inner pages carry their own. */
export async function generateMetadata(): Promise<Metadata> {
  const o = await getOptions();
  const pick = (v: string | undefined, fallback: string) => (realValue(v) ? fillOptions(v, o) : fallback);
  const title = pick(o.seo_title, SITE_TITLE);
  const description = pick(o.seo_description, SITE_DESCRIPTION);
  const image = isHttp(o.og_image) ? o.og_image : OG_IMAGE;
  return {
    title: { absolute: title },
    description,
    keywords: realValue(o.seo_keywords) ? o.seo_keywords : undefined,
    authors: [{ name: pick(o.seo_author, 'SAINTS 2027 Organizing Committee') }],
    alternates: { canonical: isHttp(o.canonical_url) ? o.canonical_url : `${SITE_URL}/` },
    openGraph: {
      title: pick(o.og_title, title), description: pick(o.og_description, description), url: `${SITE_URL}/`,
      type: 'website', siteName: pick(o.og_site_name, SITE_NAME), locale: pick(o.og_locale, 'en_IN'),
      images: [{ url: image, width: 1200, height: 630, alt: SITE_TITLE }],
    },
    twitter: {
      card: 'summary_large_image', title: pick(o.twitter_title, title), description: pick(o.twitter_description, description),
      images: [isHttp(o.twitter_image) ? o.twitter_image : image],
    },
  };
}

const DAY_PLANS = [
  ['Registration', 'Inaugural session', 'Keynote lectures'],
  ['Parallel technical sessions', 'Poster presentations', 'Workshops'],
  ['Invited talks', 'Best Paper Awards', 'Valedictory session'],
];

export default async function HomePage() {
  const [options, conf, tracks, speakers, welcome, timeline, gallery, places, faqs] = await Promise.all([
    getOptions(), getConferenceRange(), getTracks(), getSpeakers(), getWelcomeMessages(),
    getTimeline(), getGallery(), getPlaces(), getFaqs(),
  ]);

  const countdownTarget = conf
    ? `${conf.start.getFullYear()}-${pad2(conf.start.getMonth() + 1)}-${pad2(conf.start.getDate())}T09:00:00+05:30`
    : '2027-01-06T09:00:00+05:30';
  const dayCount = conf ? Math.round((+conf.end - +conf.start) / 864e5) + 1 : 3;
  const dayDate = (k: number) => {
    if (!conf) return ['6 January 2027', '7 January 2027', '8 January 2027'][k - 1] ?? '';
    const d = new Date(conf.start);
    d.setDate(d.getDate() + k - 1);
    return fmtDate(d);
  };
  const trackWord = tracks.length ? numberWord(tracks.length) : 'four';
  const heroLogo = isHttp(options.light_logo) ? sized(options.light_logo, 840) : HERO_LOGO;
  const footerNote = options.site_fullname || 'SAINTS 2027';

  const eventJsonLd = {
    '@context': 'https://schema.org', '@type': 'Event',
    name: 'SAINTS 2027: International Conference on Scientific Advances in Natural & Technological Sciences',
    alternateName: SITE_NAME,
    description: `${SITE_DESCRIPTION} (theme: Discovery to Scalable Solutions)`,
    startDate: conf ? conf.start.toISOString().slice(0, 10) : '2027-01-06',
    endDate: conf ? conf.end.toISOString().slice(0, 10) : '2027-01-08',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: `${SITE_URL}/`, image: [OG_IMAGE], inLanguage: 'en',
    location: {
      '@type': 'Place', name: 'CHRIST (Deemed to be University)',
      address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressRegion: 'Karnataka', addressCountry: 'IN' },
    },
    organizer: { '@type': 'CollegeOrUniversity', name: 'CHRIST (Deemed to be University)', url: 'https://christuniversity.in/' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, '\\u003c') }} />
      <Splash />

      {/* HERO */}
      <section id="hero" className="relative flex items-end overflow-hidden bg-primary-950 text-white">
        <HeroBackdrop />
        <div className="relative z-10 container mx-auto pt-10 pb-28 sm:pb-32 flex items-center justify-between gap-12">
          <div className="max-w-3xl">
            <p className="eyebrow eyebrow-light" data-reveal>International Conference</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.6rem] font-bold leading-[1.1] mt-5 mb-6" data-reveal style={delay(80)}>
              Scientific Advances in Natural &amp; Technological Sciences
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 mt-9" data-reveal style={delay(160)}>
              <Button asChild size="lg"><Link href="/abstract">Submit Abstract <Fa icon="fa-solid fa-arrow-right" className="btn-arrow" /></Link></Button>
              <Button asChild variant="outline" size="lg"><Link href="/#about">About the conference</Link></Button>
            </div>
          </div>

          <Link href="/" className="hero-logo hidden lg:flex" aria-label="SAINTS 2027 home" data-reveal style={delay(200)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroLogo} alt={footerNote} loading="lazy" decoding="async" className="w-full h-auto object-contain" />
          </Link>
        </div>
      </section>

      {/* Quick facts (overlaps the hero) */}
      <div className="relative z-20 container mx-auto -mt-16 sm:-mt-20">
        <div className="facts" data-reveal>
          <div className="fact">
            <Fa icon="fa-regular fa-calendar" />
            <div><p className="fact-k">Date</p><p className="fact-v"><D k="Conference Dates" fb="6–8 January 2027" /></p></div>
          </div>
          <div className="fact">
            <Fa icon="fa-solid fa-location-dot" />
            <div>
              <p className="fact-k">Venue</p>
              <a className="fact-v fact-link" href={VENUE_MAP} target="_blank" rel="noopener">
                CHRIST (Deemed to be University), Bangalore, India <Fa icon="fa-solid fa-arrow-up-right-from-square" />
              </a>
            </div>
          </div>
          <div className="fact">
            <Fa icon="fa-solid fa-building-columns" />
            <div><p className="fact-k">Organised by</p><p className="fact-v"><a href={SCHOOL_URL} target="_blank" rel="noopener" className="inline-link">School of Sciences</a></p></div>
          </div>
          <Countdown target={countdownTarget} />
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="section">
        <div className="container mx-auto">
          <div className="max-w-3xl" data-reveal>
            <p className="eyebrow">About the conference</p>
            <h2 className="h2">Discovery to Scalable Solutions</h2>
            <p className="lead">
              SAINTS is the International Conference on Scientific Advances in Natural &amp; Technological Sciences, hosted by the{' '}
              <a href={SCHOOL_URL} target="_blank" rel="noopener" className="inline-link">School of Sciences</a> at CHRIST (Deemed to be University), Bangalore.
              The 2027 edition takes place on <D k="Conference Dates" fb="6–8 January 2027" />.
            </p>
            <p className="body-copy">
              The programme has plenary lectures, parallel technical sessions, poster presentations and workshops, organised in {trackWord} tracks.
            </p>
            <Link href="/#speakers" className="link-arrow mt-2">See the tracks <Fa icon="fa-solid fa-arrow-right" /></Link>
          </div>

          <div className="why" data-reveal>
            <p className="eyebrow">Speakers and awards</p>
            <div className="why-split">
              <ul className="why-stats">
                <li>
                  <p className="why-fig">{speakers.length || 95}</p>
                  <h3>Speakers</h3>
                  <p className="why-sub">Across {trackWord} tracks</p>
                </li>
                <li>
                  <p className="why-fig">33+</p>
                  <h3>Countries</h3>
                  <p className="why-sub">Represented</p>
                </li>
              </ul>
              <ul className="why-awards">
                <li><span>Best Paper Award</span><b>Cash prize of &#8377;5,000</b></li>
                <li><span>Best Innovation Pitch Award</span></li>
                <li><span>Best PhD Thesis Award</span><b>Cash prize of &#8377;5,000</b></li>
              </ul>
            </div>
          </div>

          <PartnersSection />
        </div>
      </section>

      {/* WELCOME MESSAGES (sheet: welcome_messages) */}
      {welcome.length > 0 && (
        <section id="welcome" className="section section-paper">
          <div className="container mx-auto">
            <div className="max-w-2xl mb-12" data-reveal><h2 className="h2">Welcome messages</h2></div>
            <div className="msg-grid">
              {welcome.map((r, i) => (
                <WelcomeMessage
                  key={r.welcome_message_id ?? i} index={i}
                  html={sanitize(r.welcome_message_text ?? '')}
                  by={r.welcome_message_by ?? ''}
                  sub={[r.welcome_message_role, r.welcome_message_designation, r.welcome_message_institute].filter(Boolean).join(' · ')}
                  image={isHttp(r.welcome_message_image) ? sized(r.welcome_message_image, 160) : undefined}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* KEY DATES (sheet: important_dates) */}
      {timeline.length > 0 && (
        <section id="dates" className="section section-navy">
          <div className="container mx-auto">
            <div className="max-w-2xl mb-14" data-reveal><h2 className="h2 text-white">Key dates</h2></div>
            <ol className="timeline">
              {timeline.map((t) => (
                <li key={t.title} className={`tl-item${t.isPast ? ' is-past' : ''}${t.isNext ? ' is-next' : ''}${t.isKey ? ' tl-key' : ''}`} data-reveal>
                  <span className="tl-node" />
                  <div className="tl-card">
                    <p className="tl-date">{t.text}</p>
                    <h3 className="tl-title">{t.title}{t.isNext && <span className="tl-badge">Next</span>}</h3>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* TRACKS & SPEAKERS (sheet: tracks, speakers) */}
      {tracks.length > 0 && (
        <section id="speakers" className="section">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12" data-reveal>
              <div className="max-w-2xl"><h2 className="h2 mb-0">Tracks and speakers</h2></div>
              <p className="text-gray-600 max-w-md">Select a track to see its speakers and schedule.</p>
            </div>
            <div className="tracks-grid">
              {tracks.map((t, i) => <TrackCard key={t.id} track={t} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ABSTRACT SUBMISSION + PUBLICATIONS */}
      <section id="abstract" className="section section-paper">
        <div className="container mx-auto grid lg:grid-cols-2 gap-6">
          <div className="panel" data-reveal>
            <p className="eyebrow">Call for abstracts</p>
            <h2 className="h3">Submit your research</h2>
            <p className="body-copy">Original, unpublished work across all four tracks is welcome. Submit an abstract for oral or poster presentation.</p>
            <ul className="check-list">
              <li>Deadline: <D k="Abstract Deadline" fb="25 November 2026" /></li>
              <li>Oral and poster presentation formats</li>
              <li>Peer-reviewed by the scientific committee</li>
            </ul>
            <Button asChild variant="navy" className="mt-6"><Link href="/abstract">Submit Abstract <Fa icon="fa-solid fa-arrow-right" className="btn-arrow" /></Link></Button>
          </div>

          <div className="panel" id="publications" data-reveal style={delay(120)}>
            <p className="eyebrow">Publications</p>
            <h2 className="h3">Book of Abstracts &amp; journals</h2>
            <p className="body-copy">Every accepted abstract is published in the SAINTS 2027 Book of Abstracts. Selected papers may be invited to conference proceedings, edited books or special issues of partner journals, subject to peer review.</p>
            <ul className="check-list">
              <li>Book of Abstracts with an ISBN</li>
              <li>Conference proceedings and edited books</li>
              <li>Special issues of partner journals</li>
            </ul>
            <Link href="/abstract#publication" className="link-arrow mt-6">Publication details <Fa icon="fa-solid fa-arrow-right" /></Link>
          </div>
        </div>
      </section>

      {/* SCHEDULE */}
      <section id="schedule" className="section">
        <div className="container mx-auto">
          <div className="max-w-2xl mb-12" data-reveal>
            <p className="eyebrow">Programme</p>
            <h2 className="h2">Three days at a glance</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {DAY_PLANS.map((items, i) => (i + 1 > dayCount ? null : (
              <div className="day" key={i} data-reveal style={i ? delay(i * 100) : undefined}>
                <p className="day-n">Day {i + 1}</p>
                <p className="day-d">{dayDate(i + 1)}</p>
                <ul>{items.map((it) => <li key={it}>{it}</li>)}</ul>
              </div>
            )))}
          </div>
          <p className="text-sm text-gray-500 mt-6">The detailed programme will be published on <D k="Program Announcement" fb="20 December 2026" />.</p>
        </div>
      </section>

      {/* PLACES TO VISIT (sheet: places_to_visit) */}
      {places.length > 0 && (
        <section id="visit" className="section section-paper">
          <div className="container mx-auto">
            <div className="max-w-2xl mb-12" data-reveal><h2 className="h2">Places to visit</h2></div>
            <Collapsible className="places" count={places.length} limit={4}>
              {places.map((r, i) => {
                const linked = isHttp(r.ptv_link);
                const inner = (
                  <>
                    {isHttp(r.ptv_image) && <SheetImg src={sized(r.ptv_image, 640)} />}
                    <div className="place-cap">
                      <h3>{r.ptv_title}</h3>
                      {r.ptv_desc && <p>{r.ptv_desc}</p>}
                    </div>
                  </>
                );
                const props = { className: 'place', 'data-reveal': '', style: delay((i % 4) * 70) };
                return linked
                  ? <a key={r.ptv_id ?? i} href={r.ptv_link} target="_blank" rel="noopener" {...props}>{inner}</a>
                  : <div key={r.ptv_id ?? i} {...props}>{inner}</div>;
              })}
            </Collapsible>
          </div>
        </section>
      )}

      {/* GALLERY (sheet: gallery_images) */}
      {gallery.length > 0 && (
        <section id="gallery" className="section">
          <div className="container mx-auto">
            <div className="max-w-2xl mb-12" data-reveal><h2 className="h2">From previous editions</h2></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-reveal>
              {gallery.map((r, i) => (
                <figure className="gal" key={r.image_id ?? i}>
                  <SheetImg src={sized(r.image_url ?? '', 900)} alt={r.image_title} />
                  {r.image_title && <figcaption>{r.image_title}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ (sheet: faqs) */}
      {faqs.length > 0 && (
        <section id="faq" className="section section-paper">
          <div className="container mx-auto max-w-3xl">
            <div className="mb-10" data-reveal><h2 className="h2">Frequently asked questions</h2></div>
            <Accordion type="single" collapsible className="faqs">
              {faqs.map((r, i) => (
                <AccordionItem value={r.faq_id ?? String(i)} className="faq border" key={r.faq_id ?? i} data-reveal>
                  <AccordionTrigger className="faq-trigger">{r.faq_question}</AccordionTrigger>
                  <AccordionContent className="faq-a">
                    <div dangerouslySetInnerHTML={{ __html: richText(r.faq_answer ?? '') }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* REGISTER CTA */}
      <section id="join" className="section section-navy">
        <div className="container mx-auto text-center max-w-3xl" data-reveal>
          <h2 className="h2 text-white">Take part in SAINTS 2027</h2>
          <p className="text-white/75 text-lg mb-9">
            Abstracts are accepted until <D k="Abstract Deadline" fb="25 November 2026" />. Registration closes on <D k="Final Registration" fb="31 December 2026" />.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg"><Link href="/abstract">Submit Abstract <Fa icon="fa-solid fa-arrow-right" className="btn-arrow" /></Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/registration">Registration &amp; fees</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
