'use client';

import { useState } from 'react';
import { delay, SheetImg } from './ui';

interface Props {
  html: string;
  by: string;
  sub: string;
  image?: string;
  index: number;
}

/** A welcome message; long text is clamped and a button opens it. `html` is sanitised on the server. */
export default function WelcomeMessage({ html, by, sub, image, index }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <article className="msg" data-reveal style={delay(index * 100)}>
      <div className={`msg-body${open ? '' : ' is-clamped'}`} dangerouslySetInnerHTML={{ __html: html }} />
      <button type="button" className="msg-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? 'Show less' : 'Read full message'}
      </button>
      <footer className="msg-by">
        {image && <SheetImg src={image} alt={by} />}
        <div>
          <p className="msg-name">{by}</p>
          <p className="msg-role">{sub}</p>
        </div>
      </footer>
    </article>
  );
}
