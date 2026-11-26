import { describe, expect, it } from 'vitest';
import { richText, sanitize } from './sanitize';

describe('sanitize', () => {
  it('keeps the small allow-list of inline tags', () => {
    expect(sanitize('<b>a</b> <em>b</em><br>')).toBe('<b>a</b> <em>b</em><br />');
  });
  it('strips scripts, event handlers and styles', () => {
    expect(sanitize('<script>alert(1)</script><p onclick="x()">hi</p>')).toBe('hi');
    expect(sanitize('<b style="color:red" onclick="x()">x</b>')).toBe('<b>x</b>');
  });
  it('only keeps http(s) links and opens them safely', () => {
    const out = sanitize('<a href="https://example.com" onclick="x()">link</a>');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener"');
    expect(out).not.toContain('onclick');
    expect(sanitize('<a href="javascript:alert(1)">bad</a>')).not.toContain('javascript:');
  });
  it('turns **bold** and newlines into markup', () => {
    expect(richText('**Note**\nline two')).toBe('<strong>Note</strong><br />line two');
  });
});
