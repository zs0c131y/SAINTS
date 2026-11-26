import { describe, expect, it } from 'vitest';
import { formatRange, groupBy, isHttp, money, numberWord, parseDate, sized } from './format';

describe('dates', () => {
  it('parses the sheet format M/D/YYYY', () => {
    const d = parseDate('11/25/2026')!;
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 10, 25]);
  });
  it('returns null for junk', () => {
    expect(parseDate('soon')).toBeNull();
    expect(parseDate('')).toBeNull();
  });
  it('formats single days and ranges', () => {
    expect(formatRange('11/25/2026')).toBe('25 November 2026');
    expect(formatRange('1/6/2027', '1/8/2027')).toBe('6–8 January 2027');
    expect(formatRange('12/30/2026', '1/2/2027')).toBe('30 December 2026 – 2 January 2027');
  });
  it('falls back to the raw text when it is not a date', () => {
    expect(formatRange('TBA')).toBe('TBA');
  });
});

describe('money', () => {
  it('treats plain numbers as rupees', () => {
    expect(money('1500', 'TBA')).toBe('₹1,500');
    expect(money('Rs. 12000', 'TBA')).toBe('₹12,000');
  });
  it('keeps dollar amounts as USD', () => {
    expect(money('USD 50', 'TBA')).toBe('USD 50');
    expect(money('$200', 'TBA')).toBe('USD 200');
    expect(money('1,200 USD', 'TBA')).toBe('USD 1,200');
  });
  it('uses the fallback for blanks and passes text through', () => {
    expect(money('', 'TBA')).toBe('TBA');
    expect(money(undefined, 'TBA')).toBe('TBA');
    expect(money('On request', 'TBA')).toBe('On request');
  });
});

describe('helpers', () => {
  it('detects http(s) urls only', () => {
    expect(isHttp('https://x.y/z.png')).toBe(true);
    expect(isHttp('javascript:alert(1)')).toBe(false);
    expect(isHttp('')).toBe(false);
  });
  it('asks Cloudinary for a resized image and leaves other hosts alone', () => {
    expect(sized('https://res.cloudinary.com/x/image/upload/v1/a.png', 160)).toBe('https://res.cloudinary.com/x/image/upload/f_auto,q_auto,c_limit,w_160/v1/a.png');
    expect(sized('https://example.com/a.png', 160)).toBe('https://example.com/a.png');
  });
  it('spells small numbers', () => {
    expect(numberWord(4)).toBe('four');
    expect(numberWord(4, true)).toBe('Four');
    expect(numberWord(12)).toBe('12');
  });
  it('groups in first-seen order', () => {
    const g = groupBy([{ k: 'b', n: 1 }, { k: 'a', n: 2 }, { k: 'b', n: 3 }], (x) => x.k);
    expect(Array.from(g.keys())).toEqual(['b', 'a']);
    expect(g.get('b')).toHaveLength(2);
  });
});
