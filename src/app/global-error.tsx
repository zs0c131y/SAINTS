'use client';

/** Last-resort boundary for errors in the root layout itself; it must render its own <html> and <body>. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0, textAlign: 'center' }}>
        <div>
          <h1>Something went wrong</h1>
          <p>The site could not be loaded. Please try again in a moment.</p>
          <button type="button" onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
