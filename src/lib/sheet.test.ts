import { describe, expect, it } from 'vitest';
import { toTab } from './sheet';

describe('toTab', () => {
  it('detects a missing tab (gviz returns the first tab instead)', () => {
    expect(toTab('tracks', 'option_id,option_key\n1,site_title')).toEqual({ missing: true, rows: [] });
  });
  it('maps rows to objects and drops empty rows', () => {
    const t = toTab('faqs', 'faq_id,faq_question,faq_answer,faq_status\n1,Q1,A1,active\n,,,\n');
    expect(t.missing).toBe(false);
    expect(t.rows).toEqual([{ faq_id: '1', faq_question: 'Q1', faq_answer: 'A1', faq_status: 'active' }]);
  });
  it('keeps only active rows on tabs with a *_status column', () => {
    const t = toTab('speakers', 'speaker_id,speaker_fullname,speaker_status\n1,A,active\n2,B,inactive\n3,C,ACTIVE');
    expect(t.rows.map((r) => r.speaker_fullname)).toEqual(['A', 'C']);
  });
  it('trims cells', () => {
    const t = toTab('site_options', 'option_id,option_key,option_value\n1, site_title ,  SAINTS ');
    expect(t.rows[0]).toMatchObject({ option_key: 'site_title', option_value: 'SAINTS' });
  });
});
