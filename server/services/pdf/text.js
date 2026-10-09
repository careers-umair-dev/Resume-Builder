/** Text/URL helpers. Bundled TTF fonts cover Latin/Vietnamese/Cyrillic/Greek; built-in fonts are the fallback. */
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'.split(''));
const MAP = { đ: 'd', Đ: 'D', ł: 'l', Ł: 'L', ø: 'o', Ø: 'O', ı: 'i' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function clean(value, embedded = true) {
  if (value == null) return '';
  let s = String(value)
    .replace(/\r\n?|[\u2028\u2029]/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u2060\ufeff]/g, '')
    .replace(/\p{Extended_Pictographic}|\uFE0F/gu, '')
    .normalize('NFC');
  if (embedded) return s.trim();
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (ch === '\n' || (c >= 32 && c < 127) || (c >= 160 && c <= 255) || WIN_ANSI_EXTRA.has(ch)) out += ch;
    else if (MAP[ch]) out += MAP[ch];
    else {
      const base = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (base !== ch && /^[\x20-\x7e]+$/.test(base)) out += base;
    }
  }
  return out.trim();
}

function formatDate(v) {
  const s = String(v || '').trim();
  const m = /^(\d{4})-(\d{1,2})$/.exec(s);
  if (m && +m[2] >= 1 && +m[2] <= 12) return `${MONTHS[+m[2] - 1]} ${m[1]}`;
  return s;
}

function dateRange(start, end, current) {
  const a = formatDate(start);
  const b = current ? 'Present' : formatDate(end);
  if (a && b) return `${a} – ${b}`;
  return a || b || '';
}

const withProtocol = (u) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);
const displayUrl = (u) => String(u).replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '');

/** Split free text into paragraphs and bullet lines ("- ", "* ", "• "). */
function splitDescription(text) {
  const paragraphs = [];
  const bullets = [];
  String(text || '').split('\n').forEach((line) => {
    const t = line.trim();
    if (!t) return;
    const m = /^[-*•]\s+(.*)$/.exec(t);
    if (m) bullets.push(m[1]);
    else paragraphs.push(t);
  });
  return { paragraphs, bullets };
}

function hex(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) {
  const [r1, g1, b1] = hex(a); const [r2, g2, b2] = hex(b);
  const f = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${f(r1, r2)}${f(g1, g2)}${f(b1, b2)}`;
}
function luminance(h) {
  const [r, g, b] = hex(h).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

module.exports = { clean, formatDate, dateRange, withProtocol, displayUrl, splitDescription, mix, luminance };
