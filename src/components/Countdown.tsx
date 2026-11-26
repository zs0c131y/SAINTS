'use client';

import { useEffect, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

/** Time until `target` (an ISO date-time). Renders zeros until mounted so server and client markup match. */
export default function Countdown({ target }: { target: string }) {
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const t = new Date(target).getTime();
    const tick = () => setDiff(Math.max(0, t - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const d = diff ?? 0;
  const parts: [string, string][] = [
    [pad(Math.floor(d / 864e5)), 'Days'],
    [pad(Math.floor(d / 36e5) % 24), 'Hrs'],
    [pad(Math.floor(d / 6e4) % 60), 'Min'],
    [pad(Math.floor(d / 1e3) % 60), 'Sec'],
  ];

  return (
    <div className="fact fact-count" id="countdown" aria-label="Time until the conference begins">
      {parts.map(([value, label]) => (
        <div className="cd" key={label}>
          <b suppressHydrationWarning>{value}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
