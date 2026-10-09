import { ENTRY_SECTIONS, PERSONAL_FIELDS } from '../constants/builder';

export const normalizeUrl = (v) => { const t = (v || '').trim(); return t && !/^https?:\/\//i.test(t) ? `https://${t}` : t; };
const validUrl = (v) => !v || /^https?:\/\/\S+\.\S+$/i.test(v);
const validEmail = (v) => !v || /^\S+@\S+\.\S+$/.test(v);
const validPhone = (v) => !v || /^[+(]?\d[\d\s().-]{5,}$/.test(v);

/** -> { 'personalInfo.email': 'message', 'experience.<id>.endDate': 'message', name: 'message' } */
export function validateResume(d) {
  const errors = {};
  if (!d.name || !d.name.trim()) errors.name = 'Resume name is required';
  const p = d.personalInfo || {};
  if (!validEmail(p.email)) errors['personalInfo.email'] = 'Enter a valid email address';
  if (!validPhone(p.phone)) errors['personalInfo.phone'] = 'Enter a valid phone number';
  PERSONAL_FIELDS.filter((f) => f.url).forEach((f) => { if (!validUrl(p[f.key])) errors[`personalInfo.${f.key}`] = 'Enter a valid link, e.g. https://example.com'; });
  Object.entries(ENTRY_SECTIONS).forEach(([section, cfg]) => {
    (d[section] || []).forEach((entry) => {
      cfg.fields.filter((f) => f.type === 'url').forEach((f) => { if (!validUrl(entry[f.key])) errors[`${section}.${entry._id}.${f.key}`] = 'Enter a valid link, e.g. https://example.com'; });
      if (entry.startDate && entry.endDate && !entry.current && entry.endDate < entry.startDate) errors[`${section}.${entry._id}.endDate`] = 'End date must be after the start date';
    });
  });
  return errors;
}

/** Replaces invalid values with the last saved ones so a single bad field never blocks saving everything else. */
export function revertInvalid(draft, saved, errors) {
  let out = draft;
  Object.keys(errors).forEach((key) => {
    const parts = key.split('.');
    if (parts[0] === 'name') out = { ...out, name: saved.name };
    else if (parts[0] === 'personalInfo') out = { ...out, personalInfo: { ...out.personalInfo, [parts[1]]: saved.personalInfo?.[parts[1]] ?? '' } };
    else {
      const [section, id, field] = parts;
      const prev = (saved[section] || []).find((e) => e._id === id);
      out = { ...out, [section]: out[section].map((e) => (e._id === id ? { ...e, [field]: prev ? prev[field] ?? '' : '' } : e)) };
    }
  });
  return out;
}
