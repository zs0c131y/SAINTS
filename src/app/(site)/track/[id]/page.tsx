import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import SpeakerCard from '@/components/SpeakerCard';
import TrackCard from '@/components/TrackCard';
import { getOptions, getTrack, getTrackSchedules, getTrackSpeakers, getTracks } from '@/lib/content';
import { groupBy } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';
import { speakerPhotoUrls } from '@/lib/speakers';

export const revalidate = 60;
export const dynamicParams = true;

type Params = { id: string };

/** Pre-render the tracks known at build time; new ones in the sheet render on first visit. */
export async function generateStaticParams(): Promise<Params[]> {
  return (await getTracks()).map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const [track, options] = await Promise.all([getTrack(id), getOptions()]);
  if (!track) return { title: 'Track not found', robots: { index: false, follow: true } };
  const site = options.site_fullname || 'SAINTS 2027';
  return pageMetadata({
    title: track.theme ? `${track.title}: ${track.theme}` : track.title,
    description: `${track.title}${track.theme ? `: ${track.theme}. ` : '. '}Speakers and schedule for this ${site} track.`,
    path: `/track/${track.id}`,
  });
}

export default async function TrackPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const track = await getTrack(id);
  if (!track) notFound();

  const [tracks, speakers, schedules] = await Promise.all([getTracks(), getTrackSpeakers(id), getTrackSchedules(id)]);
  const groups = Array.from(groupBy(speakers, (s) => s.speaker_category ?? ''));
  const others = tracks.filter((t) => t.id !== id);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Tracks', href: '/#speakers' }, { label: track.title }]}
        eyebrow="Track"
        title={track.title}
        lead={track.theme || undefined}
      />

      {speakers.length > 0 && (
        <section className="section">
          <div className="container mx-auto">
            <div className="max-w-2xl mb-10"><p className="eyebrow">Speakers</p></div>
            <div className="cm">
              {groups.map(([category, list]) => (
                <div className="cm-group" key={category}>
                  {category && <h3 className="cm-role">{category}</h3>}
                  <div className="speaker-grid">
                    {list.map((s, i) => (
                      <SpeakerCard
                        key={s.speaker_id ?? i}
                        name={s.speaker_fullname ?? ''}
                        affiliation={s.speaker_affiliation ?? ''}
                        photos={speakerPhotoUrls(s)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {schedules.length > 0 && (
        <section className="section section-paper">
          <div className="container mx-auto">
            <div className="max-w-2xl mb-10"><p className="eyebrow">Schedule</p></div>
            <div className="schedule-list">
              {schedules.map((r, i) => (
                <div className="schedule-embed" key={r.schedule_id ?? i}>
                  <iframe src={r.schedule_embed_url} loading="lazy" title={`Schedule, ${track.title}`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="section">
          <div className="container mx-auto">
            <div className="max-w-2xl mb-10"><p className="eyebrow">Other tracks</p></div>
            <div className="tracks-grid">
              {others.map((t) => <TrackCard key={t.id} track={t} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
