import Link from 'next/link';
import D from '@/components/D';
import PageHero from '@/components/PageHero';
import { Fa, SheetImg, delay } from '@/components/ui';
import { getFees, getSteps } from '@/lib/content';
import { isHttp, money, sized } from '@/lib/format';
import { sanitize } from '@/lib/sanitize';
import { pageMetadata } from '@/lib/seo';
import { REGISTRATION_FORM } from '@/lib/site';

export const revalidate = 60;

export const metadata = pageMetadata({
  title: 'Registration',
  description: 'Registration for SAINTS 2027: fee categories, early-bird rates and how to register.',
  path: '/registration',
});

/** Shown only if the registration_fee tab is empty or unreachable. */
const FALLBACK_FEES: [string, string, string][] = [
  ['UG/PG Students', '1500', '2000'], ['Research Scholars', '2000', '2500'], ['Faculty / Scientist (India)', '5000', '6000'],
  ['Industry Professionals', '10000', '12000'], ['International Students', 'USD 50', 'USD 75'], ['International Delegates', 'USD 200', 'USD 250'],
  ['Accompanying Person', '2000', '2500'],
];

export default async function RegistrationPage() {
  const [feeRows, steps] = await Promise.all([getFees(), getSteps()]);
  const fees = feeRows.length
    ? feeRows.map((r) => ({ category: r.reg_category ?? '', early: r.reg_fee_early_bird, regular: r.reg_fee_regular }))
    : FALLBACK_FEES.map(([category, early, regular]) => ({ category, early, regular }));

  return (
    <>
      <PageHero
        reveal
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Registration' }]}
        eyebrow="Join us"
        title="Registration"
        lead={<>Early bird rates apply until <D k="Early Bird Deadline" fb="20 November 2026" />.</>}
        actions={<>
          <Link href="#fees" className="btn btn-primary btn-lg">View fees <Fa icon="fa-solid fa-arrow-right" className="btn-arrow" /></Link>
          <Link href="/abstract" className="btn btn-outline-light btn-lg">Submit Abstract</Link>
        </>}
      />

      <section id="fees" className="section">
        <div className="container mx-auto">
          <div className="max-w-2xl mb-12" data-reveal>
            <p className="eyebrow">Registration</p>
            <h2 className="h2">Registration fees</h2>
          </div>
          <div className="fee-grid">
            {fees.map((f, i) => (
              <div className="fee" key={f.category} data-reveal style={delay((i % 4) * 70)}>
                <h3>{f.category}</h3>
                <dl>
                  <div><dt>Early bird</dt><dd>{money(f.early, 'TBA')}</dd></div>
                  <div><dt>Regular</dt><dd>{money(f.regular, 'TBA')}</dd></div>
                </dl>
              </div>
            ))}
          </div>
          <ul className="text-sm text-gray-500 mt-8 space-y-1">
            <li>* All fees are inclusive of taxes where applicable.</li>
            <li>* Early bird rates apply until <D k="Early Bird Deadline" fb="20 November 2026" />.</li>
          </ul>
        </div>
      </section>

      {steps.length > 0 && (
        <section id="register" className="section section-paper">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-10" data-reveal>
              <p className="eyebrow">How to register</p>
              <h2 className="h2">Registration steps</h2>
            </div>
            <ol className="steps">
              {steps.map((r, i) => (
                <li className="step" key={r.reg_step_id ?? i} data-reveal>
                  <span className="step-n">{i + 1}</span>
                  <div className="step-body">
                    <p className="step-title" dangerouslySetInnerHTML={{ __html: sanitize(r.reg_step_title ?? '') }} />
                    {r.reg_step_description && <p className="step-desc" dangerouslySetInnerHTML={{ __html: sanitize(r.reg_step_description) }} />}
                    {isHttp(r.reg_step_screenshot) && <SheetImg src={sized(r.reg_step_screenshot, 900)} alt={`Step ${i + 1} screenshot`} className="step-shot" />}
                  </div>
                </li>
              ))}
            </ol>
            <div id="registration-form" className="reg-form">
              <a href={REGISTRATION_FORM} target="_blank" rel="noopener" className="btn btn-navy btn-lg">
                Open the registration form <Fa icon="fa-solid fa-arrow-up-right-from-square" className="btn-arrow" />
              </a>
              <p>Keep your payment receipt ready to upload.</p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
