'use client';

import { useEffect, useRef, useState } from 'react';

interface Props { name: string; affiliation: string; photos: string[] }

/** Filled head-and-shoulders silhouette, cropped at the bottom edge like a portrait. */
function Avatar() {
  return (
    <svg viewBox="0 0 88 88" className="speaker-avatar" aria-hidden="true">
      <circle cx="44" cy="35" r="16" />
      <path d="M8 92c0-21 16-35 36-35s36 14 36 35z" />
    </svg>
  );
}

export default function SpeakerCard({ name, affiliation, photos }: Props) {
  const [i, setI] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const url = photos[i];

  // An image can fail before React attaches onError (during SSR hydration); catch that case here.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setI((n) => n + 1);
  }, [i]);

  return (
    <article className="speaker">
      <div className={`speaker-photo${url ? '' : ' no-photo'}`}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={url} ref={imgRef} src={url} alt={name} loading="lazy" decoding="async" onError={() => setI((n) => n + 1)} />
        ) : <Avatar />}
      </div>
      <div className="speaker-text">
        <h4 className="speaker-name">{name}</h4>
        <p className="speaker-aff">{affiliation}</p>
      </div>
    </article>
  );
}
