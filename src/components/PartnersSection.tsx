import Image from 'next/image';
import AcademicPartners from './AcademicPartners';
import { academic, books, industry, journals, type Logo } from '@/data/partners';
import { delay } from './ui';

function LogoGrid({ logos, className }: { logos: Logo[]; className: string }) {
  return (
    <ul className={`pub-grid ${className}`}>
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
  );
}

/** Publication, academic and industry partner logos (static: they only change with a code release). */
export default function PartnersSection() {
  return (
    <div className="pubs">
      <section className="pub-group" data-reveal aria-labelledby="pub-journals">
        <header className="pub-head">
          <h3 id="pub-journals">Journal Publication Opportunities</h3>
          <p>Selected high quality articles will be considered for publication in reputed Scopus-indexed journals.</p>
        </header>
        <LogoGrid logos={journals} className="pub-journals" />
      </section>

      <section className="pub-group" data-reveal style={delay(0)} aria-labelledby="pub-books">
        <header className="pub-head"><h3 id="pub-books">Scopus-Indexed Book Volumes</h3></header>
        <LogoGrid logos={books} className="pub-books" />
      </section>

      <section className="pub-group" data-reveal aria-labelledby="pub-academic">
        <header className="pub-head">
          <h3 id="pub-academic">Academic Partners</h3>
          <p>{academic.length} institutions from around the world.</p>
        </header>
        <AcademicPartners logos={academic} />
      </section>

      <section className="pub-group" data-reveal aria-labelledby="pub-industry">
        <header className="pub-head"><h3 id="pub-industry">Industry Partners</h3></header>
        <LogoGrid logos={industry} className="pub-books" />
      </section>
    </div>
  );
}
