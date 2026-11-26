'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  className: string;
  /** Number of children in total, to label the button. */
  count: number;
  /** How many children show while collapsed (must match the CSS rule for [data-collapsed]). */
  limit: number;
  children: ReactNode;
}

/** Shows the first `limit` children; a button reveals the rest. All children are server-rendered. */
export default function Collapsible({ className, count, limit, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={className} data-collapsed={!open && count > limit} style={{ ['--limit' as string]: limit }}>{children}</div>
      {count > limit && (
        <div className="more-wrap">
          <Button type="button" variant="ghost" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? 'Show fewer' : `Show all ${count}`}
          </Button>
        </div>
      )}
    </>
  );
}
