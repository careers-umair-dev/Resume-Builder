const { renderResume } = require('./render');
const { clean } = require('./text');

/** Returns { buffer, filename } for a resume document. Throws if the PDF cannot be produced. */
exports.generateResumePdf = async (resume) => {
  const plain = typeof resume.toObject === 'function' ? resume.toObject() : resume;
  const buffer = await renderResume(plain);
  if (!buffer || buffer.length < 1000 || buffer.slice(0, 5).toString() !== '%PDF-') {
    throw new Error('PDF generation produced an invalid file');
  }
  const base = clean(plain.name || plain.personalInfo?.fullName || 'resume', false)
    .replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 60) || 'resume';
  return { buffer, filename: `${base}.pdf` };
};
