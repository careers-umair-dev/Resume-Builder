/**
 * Data-driven template specs. The React preview (Phase 6) reads the same specs so preview and PDF stay in sync.
 * layout: single | sidebar-left        header: banner | centered | left | split | main-name
 * skills: chips | inline | grouped | bars | dots      dateMode: right | left-col
 */
const base = { layout: 'single', font: 'sans', headingStyle: 'underline', headingCaps: false, skills: 'chips', dateMode: 'right', bullet: 'circle', photo: 'circle', photoSide: 'right', spacing: 1, sizeScale: 1, marginScale: 1, monochrome: false, nameSize: 26 };

const TEMPLATES = {
  'modern-professional': { ...base, id: 'modern-professional', name: 'Modern Professional', header: 'banner' },
  'minimal-executive': { ...base, id: 'minimal-executive', name: 'Minimal Executive', header: 'left', headingStyle: 'plain', headingCaps: true, skills: 'inline', bullet: 'dash', photo: 'none', spacing: 1.1, sizeScale: 0.98, marginScale: 1.3, nameSize: 30 },
  'creative-developer': { ...base, id: 'creative-developer', name: 'Creative Developer', layout: 'sidebar-left', header: 'main-name', headingStyle: 'bar', skills: 'bars', bullet: 'square', photoSide: 'top', nameSize: 28, sidebar: { width: 178, bg: 'primary', sections: ['skills', 'languages', 'certifications', 'interests'] } },
  'elegant-corporate': { ...base, id: 'elegant-corporate', name: 'Elegant Corporate', header: 'split', font: 'serif', headingStyle: 'underline', headingCaps: true, skills: 'dots', photo: 'rounded', nameSize: 28, sizeScale: 1.02 },
  'compact-ats': { ...base, id: 'compact-ats', name: 'Compact ATS', header: 'left', skills: 'inline', photo: 'none', monochrome: true, spacing: 0.8, sizeScale: 0.96, marginScale: 0.8, nameSize: 22 },
  'classic-professional': { ...base, id: 'classic-professional', name: 'Classic Professional', header: 'centered', font: 'serif', headingStyle: 'caps', headingCaps: true, skills: 'grouped', dateMode: 'left-col', photo: 'none', photoSide: 'top', nameSize: 26 },
};

module.exports = { TEMPLATES, DEFAULT_TEMPLATE: 'modern-professional' };
