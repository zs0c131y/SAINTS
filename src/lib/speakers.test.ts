import { describe, expect, it } from 'vitest';
import { speakerPhotoUrls } from './speakers';

describe('speakerPhotoUrls', () => {
  it('puts the sheet photo first, then the local copy', () => {
    const urls = speakerPhotoUrls({ speaker_fullname: 'Prof. Vinay J. Ribeiro', speaker_image: 'https://example.com/a.jpg' });
    expect(urls).toEqual(['https://example.com/a.jpg', '/assets/images/speakers/vinay-j-ribeiro.jpg']);
  });
  it('uses the local copy alone when the sheet has no photo', () => {
    expect(speakerPhotoUrls({ speaker_fullname: 'Prof. Dr. Barbara Sprick', speaker_image: '' })).toEqual(['/assets/images/speakers/barbara-sprick.jpg']);
  });
  it('returns nothing for a speaker with no photo anywhere (the card shows the avatar)', () => {
    expect(speakerPhotoUrls({ speaker_fullname: 'Someone Else', speaker_image: '' })).toEqual([]);
  });
  it('ignores non-http image values', () => {
    expect(speakerPhotoUrls({ speaker_fullname: 'Someone Else', speaker_image: 'javascript:alert(1)' })).toEqual([]);
  });
});
