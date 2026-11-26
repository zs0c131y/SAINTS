import Link from 'next/link';
import { Fa, delay } from './ui';
import { pad2 } from '@/lib/format';
import type { Track } from '@/lib/content';

export default function TrackCard({ track, index }: { track: Track; index?: number }) {
  const animate = index !== undefined;
  return (
    <Link
      href={`/track/${track.id}`} className="track"
      {...(animate ? { 'data-reveal': '', style: delay(index * 80) } : {})}
    >
      <span className="track-no">{pad2(Number(track.id) || track.id)}</span>
      <h3>{track.title}</h3>
      {track.theme && <p>{track.theme}</p>}
      <span className="track-go">View track <Fa icon="fa-solid fa-arrow-right" /></span>
    </Link>
  );
}
