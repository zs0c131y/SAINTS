import 'server-only';
import sanitizeHtml from 'sanitize-html';

/** Sheet cells may hold a few inline tags. Everything else is stripped; links must be http(s). */
export function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['a', 'strong', 'b', 'em', 'i', 'br', 'u'],
    allowedAttributes: { a: ['href', 'target', 'rel', 'class'] },
    allowedSchemes: ['http', 'https'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: '_blank', rel: 'noopener', class: 'inline-link' },
      }),
    },
  });
}

/** **bold** and line breaks, then sanitised. */
export const richText = (s: string) => sanitize(s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'));
