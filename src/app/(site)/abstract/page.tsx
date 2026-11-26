import Link from 'next/link';
import D from '@/components/D';
import { Button } from '@/components/ui/button';
import PageHero from '@/components/PageHero';
import { Fa, delay } from '@/components/ui';
import { pageMetadata } from '@/lib/seo';
import { ABSTRACT_FORM } from '@/lib/site';

export const revalidate = 60;

export const metadata = pageMetadata({
  title: 'Abstract Submission',
  description: 'Abstract submission for SAINTS 2027: guidelines, important dates, presentation categories, and awards.',
  path: '/abstract',
});

const AWARDS = [
  { icon: 'fa-solid fa-trophy', title: 'Best Oral Presentation Award', intro: 'Presented to the author delivering the most outstanding oral presentation based on:', points: ['Scientific quality', 'Originality and innovation', 'Technical merit', 'Clarity of presentation', 'Relevance to conference themes'] },
  { icon: 'fa-solid fa-award', title: 'Best Poster Presentation Award', intro: 'Presented to the author of the most impactful poster based on:', points: ['Scientific excellence', 'Innovation', 'Visual presentation', 'Effective communication of research findings'] },
  { icon: 'fa-solid fa-graduation-cap', title: 'Best Thesis Pitch Award', intro: 'Recognising exceptional thesis work presented by postgraduate and doctoral researchers.' },
  { icon: 'fa-solid fa-lightbulb', title: 'Innovation Award', intro: 'Recognising innovative technologies, prototypes, start-ups, or translational research with significant societal or industrial impact.' },
];

export default function AbstractPage() {
  return (
    <>
      <PageHero
        reveal
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Abstract Submission' }]}
        eyebrow="Call for abstracts"
        title="Abstract Submission"
        lead={<>Abstracts are accepted until <D k="Abstract Deadline" fb="25 November 2026" /> through the online submission form.</>}
        actions={<>
          <Button asChild size="lg"><a href={ABSTRACT_FORM} target="_blank" rel="noopener">Submit Abstract <Fa icon="fa-solid fa-arrow-right" className="btn-arrow" /></a></Button>
          <Button asChild variant="outline" size="lg"><Link href="#guidelines">Read Guidelines</Link></Button>
          <Button asChild variant="outline" size="lg"><Link href="/registration">Registration &amp; fees</Link></Button>
        </>}
      />

      {/* INTRO + DATES */}
      <section className="section">
        <div className="container mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7" data-reveal>
            <p className="eyebrow">Invitation</p>
            <h2 className="h2">Who can submit</h2>
            <p className="lead">Researchers, academicians, industry professionals, innovators, and students are invited to submit abstracts presenting original and unpublished work aligned with the thematic tracks of the International Conference on Scientific Advances in Natural and Technological Sciences (SAINTS 2027).</p>
            <p className="body-copy">SAINTS 2027 aims to foster interdisciplinary research collaborations and provide a global platform for exchanging knowledge and innovative solutions to challenges in Energy, Water, Health, Environment, Advanced Materials, Artificial Intelligence, Data Science, and Sustainable Development.</p>
            <p className="body-copy">All abstracts must be prepared using the official SAINTS 2027 Abstract Template and submitted through the online submission portal.</p>
          </div>

          <aside className="lg:col-span-5 key-dates" data-reveal style={delay(120)}>
            <p className="eyebrow eyebrow-light">Important dates</p>
            <dl>
              <div><dt>Abstract Submission Deadline</dt><dd><D k="Abstract Deadline" fb="25 November 2026" /></dd></div>
              <div><dt>Notification of Acceptance</dt><dd><D k="Acceptance Notification" fb="30 November 2026" /></dd></div>
            </dl>
          </aside>
        </div>
      </section>

      {/* PRESENTATION CATEGORIES */}
      <section id="categories" className="section section-paper">
        <div className="container mx-auto">
          <div className="max-w-2xl mb-12" data-reveal>
            <p className="eyebrow">Presentation categories</p>
            <h2 className="h2">Oral and poster formats</h2>
            <p className="body-copy">SAINTS 2027 will feature the following presentation formats.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="panel" data-reveal>
              <span className="why-icon mb-4"><Fa icon="fa-solid fa-microphone-lines" /></span>
              <h3 className="h3">Oral Presentations</h3>
              <ul className="check-list">
                <li>Presentation duration: 10 minutes</li>
                <li>Discussion and Q&amp;A: 5 minutes</li>
                <li>Presentations must be delivered in English</li>
                <li>Selected presentations may be considered for special awards</li>
              </ul>
            </div>
            <div className="panel" data-reveal style={delay(100)}>
              <span className="why-icon mb-4"><Fa icon="fa-solid fa-chalkboard" /></span>
              <h3 className="h3">Poster Presentations</h3>
              <ul className="check-list">
                <li>Posters will be displayed during dedicated poster sessions</li>
                <li>Authors will have opportunities to interact with participants, experts, and industry representatives</li>
                <li>Poster dimensions and guidelines will be provided after acceptance</li>
              </ul>
            </div>
          </div>

          <div className="pref" data-reveal>
            <h3>Presentation preference</h3>
            <p>During abstract submission, authors may indicate one of the following preferences:</p>
            <ul>
              <li>Oral Presentation</li>
              <li>Poster Presentation</li>
              <li>Either Oral or Poster Presentation</li>
            </ul>
            <p className="pref-note">The final decision regarding the presentation format will be made by the Scientific Committee based on the peer-review process and conference scheduling requirements.</p>
          </div>
        </div>
      </section>

      {/* GUIDELINES */}
      <section id="guidelines" className="section">
        <div className="container mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5" data-reveal>
            <p className="eyebrow">Guidelines</p>
            <h2 className="h2">Abstract preparation</h2>
            <p className="body-copy">These requirements apply to every submission.</p>
            <Button asChild variant="navy"><a href="/assets/SAINTS_Abstract_template.docx" download><Fa icon="fa-solid fa-file-word" /> Download Abstract Template</a></Button>
            <p className="text-sm text-gray-500 mt-3">SAINTS_Abstract_template.docx</p>
          </div>
          <div className="lg:col-span-7 panel" data-reveal style={delay(100)}>
            <ul className="check-list">
              <li>Abstracts must be submitted in Microsoft Word format (.doc or .docx)</li>
              <li>Authors must use the official SAINTS 2027 Abstract Template</li>
              <li>Maximum length: one page</li>
              <li>Abstracts should clearly describe: background and objectives, methodology, key results, and major conclusions and significance</li>
              <li>Abstracts must be written in clear and concise English</li>
              <li>All submissions should represent original work that has not been previously published</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PUBLICATION */}
      <section id="publication" className="section section-navy">
        <div className="container mx-auto grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5" data-reveal>
            <p className="eyebrow eyebrow-light">Publication</p>
            <h2 className="h2 text-white">Publication of accepted abstracts</h2>
            <p className="text-white/75 leading-relaxed">All accepted abstracts will be published in the SAINTS 2027 Book of Abstracts.</p>
          </div>
          <div className="lg:col-span-7" data-reveal style={delay(100)}>
            <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4">The Book of Abstracts will</p>
            <ul className="check-list check-list-light">
              <li>Be assigned an ISBN</li>
              <li>Be made available to all conference participants</li>
              <li>Serve as a permanent record of the scientific contributions presented during the conference</li>
            </ul>
            <p className="text-white/75 leading-relaxed mt-6">Selected high-quality papers may also be invited for submission to conference proceedings, edited books, or special issues of partner journals, subject to peer review.</p>
          </div>
        </div>
      </section>

      {/* AWARDS */}
      <section id="awards" className="section">
        <div className="container mx-auto">
          <div className="max-w-2xl mb-12" data-reveal>
            <p className="eyebrow">Awards and recognition</p>
            <h2 className="h2">Conference awards</h2>
            <p className="body-copy">SAINTS 2027 will present the following awards.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {AWARDS.map((a, i) => (
              <article className="award" key={a.title} data-reveal style={i % 2 ? delay(100) : undefined}>
                <span className="why-icon"><Fa icon={a.icon} /></span>
                <h3>{a.title}</h3>
                <p>{a.intro}</p>
                {a.points && <ul className="check-list">{a.points.map((p) => <li key={p}>{p}</li>)}</ul>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SUBMISSION PORTAL */}
      <section id="portal" className="section section-paper">
        <div className="container mx-auto text-center max-w-3xl" data-reveal>
          <p className="eyebrow justify-center">Submission portal</p>
          <h2 className="h2">Submit your abstract</h2>
          <p className="body-copy text-lg mb-9">Prepare your abstract in the SAINTS 2027 template, then submit it through the online form.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg"><a href={ABSTRACT_FORM} target="_blank" rel="noopener">Submit Abstract <Fa icon="fa-solid fa-arrow-right" className="btn-arrow" /></a></Button>
            <Button asChild variant="navy" size="lg"><a href="/assets/SAINTS_Abstract_template.docx" download><Fa icon="fa-solid fa-download" /> Download Template</a></Button>
          </div>
        </div>
      </section>
    </>
  );
}
