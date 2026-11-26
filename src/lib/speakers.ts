import { isHttp, sized } from './format';
import { LOCAL_SPEAKER_PHOTOS } from './site';

/**
 * Photo candidates for a speaker, best first: the sheet's photo, then the copy served from this site.
 * The card falls through the list if an image fails to load (e.g. an expired link), then to a placeholder.
 */
export function speakerPhotoUrls(speaker: { speaker_fullname?: string; speaker_image?: string }, width = 160): string[] {
  const urls: string[] = [];
  if (isHttp(speaker.speaker_image)) urls.push(sized(speaker.speaker_image, width));
  const local = LOCAL_SPEAKER_PHOTOS.find(([re]) => re.test(speaker.speaker_fullname ?? ''));
  if (local) urls.push(local[1]);
  return urls;
}
