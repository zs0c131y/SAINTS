import { dateText } from '@/lib/content';

/** A date from the sheet's `important_dates` tab, looked up by title, e.g. <D k="Abstract Deadline" fb="25 November 2026" />. */
export default async function D({ k, fb }: { k: string; fb: string }) {
  return <>{await dateText(k, fb)}</>;
}
