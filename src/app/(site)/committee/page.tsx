import PageHero from '@/components/PageHero';
import { SheetImg } from '@/components/ui';
import { getCommittee } from '@/lib/content';
import { groupBy, isHttp, sized } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata = pageMetadata({
  title: 'Organizing Committee',
  description: 'The organizing committee of SAINTS 2027, hosted by the School of Sciences at CHRIST (Deemed to be University), Bangalore.',
  path: '/committee',
});

export default async function CommitteePage() {
  const members = await getCommittee();
  const groups = Array.from(groupBy(members, (m) => m.member_role ?? ''));

  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: 'Organizing Committee' }]} eyebrow="Team" title="Organizing Committee" />

      {groups.length > 0 && (
        <section className="section">
          <div className="container mx-auto">
            <div className="cm">
              {groups.map(([role, list]) => (
                <div className="cm-group" key={role} data-reveal>
                  {role && <h3 className="cm-role">{role}</h3>}
                  <ul className="cm-list">
                    {list.map((m, i) => (
                      <li className="cm-member" key={m.member_id ?? i}>
                        {isHttp(m.member_image) && <SheetImg src={sized(m.member_image, 160)} alt={m.member_fullname} />}
                        <div>
                          <p className="cm-name">{m.member_fullname}</p>
                          {m.member_designation && <p className="cm-desig">{m.member_designation}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
