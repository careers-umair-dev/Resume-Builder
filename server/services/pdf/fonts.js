const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '../../assets/fonts');
const FILES = {
  sans: { regular: 'Inter-Regular.ttf', bold: 'Inter-Bold.ttf', italic: 'Inter-Italic.ttf' },
  serif: { regular: 'Lora-Regular.ttf', bold: 'Lora-Bold.ttf', italic: 'Lora-Italic.ttf' },
  mono: { regular: 'SourceCodePro-Regular.ttf', bold: 'SourceCodePro-Bold.ttf', italic: 'SourceCodePro-Italic.ttf' },
};
const BUILTIN = {
  sans: { regular: 'Helvetica', bold: 'Helvetica-Bold', italic: 'Helvetica-Oblique' },
  serif: { regular: 'Times-Roman', bold: 'Times-Bold', italic: 'Times-Italic' },
  mono: { regular: 'Courier', bold: 'Courier-Bold', italic: 'Courier-Oblique' },
};
const CUSTOM_TO_KEY = { Helvetica: 'sans', 'Times-Roman': 'serif', Courier: 'mono' };

/** Registers bundled fonts on the doc. Returns the face names for one family key + whether they are embedded. */
function loadFace(doc, key) {
  const paths = Object.fromEntries(Object.entries(FILES[key]).map(([k, f]) => [k, path.join(DIR, f)]));
  if (Object.values(paths).every((p) => fs.existsSync(p))) {
    const names = {};
    for (const [k, p] of Object.entries(paths)) {
      names[k] = `${key}-${k}`;
      doc.registerFont(names[k], p);
    }
    return { ...names, embedded: true };
  }
  return { ...BUILTIN[key], embedded: false };
}

module.exports = { loadFace, CUSTOM_TO_KEY };
