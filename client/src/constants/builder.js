import { Award, BookOpen, Briefcase, FileText, FolderGit2, GraduationCap, Heart, Languages, ListChecks, Sparkles, Trophy, Wrench, Medal } from 'lucide-react';

export const EDITABLE_KEYS = ['name', 'template', 'personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'achievements', 'languages', 'volunteer', 'interests', 'publications', 'awards', 'enabledSections', 'sectionOrder', 'customization'];

export const SECTION_META = {
  summary: { label: 'Professional Summary', icon: FileText },
  experience: { label: 'Experience', icon: Briefcase },
  education: { label: 'Education', icon: GraduationCap },
  skills: { label: 'Skills', icon: Wrench },
  projects: { label: 'Projects', icon: FolderGit2 },
  certifications: { label: 'Certifications', icon: Award },
  achievements: { label: 'Achievements', icon: Trophy },
  languages: { label: 'Languages', icon: Languages },
  volunteer: { label: 'Volunteer Experience', icon: Heart },
  interests: { label: 'Interests', icon: Sparkles },
  publications: { label: 'Publications', icon: BookOpen },
  awards: { label: 'Awards', icon: Medal },
};
export const PERSONAL_ICON = ListChecks;

export const SKILL_CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Soft Skills'];
export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
export const PROFICIENCY = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'];

export const SUMMARY_SUGGESTIONS = [
  'Computer science student with hands-on experience building full-stack web applications using React, Node.js and MongoDB. Quick learner who enjoys turning ideas into polished, working products and collaborating in small teams.',
  'Motivated early-career developer with a focus on clean, maintainable code and good user experience. Completed several projects end to end, from database design to deployment, and eager to contribute to a real engineering team.',
  'Detail-oriented intern candidate with a strong foundation in data structures, REST APIs and responsive UI development. Looking for an opportunity to learn from experienced engineers while delivering reliable features.',
];

const T = (key, label, max, extra = {}) => ({ key, label, type: 'text', max, ...extra });
const M = (key, label) => ({ key, label, type: 'month', half: true });

/** Config-driven entry sections: drives the editor UI, validation and blank entries. */
export const ENTRY_SECTIONS = {
  experience: {
    addLabel: 'Add experience', max: 50, itemName: 'experience',
    blank: () => ({ title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '', bullets: [] }),
    title: (e) => [e.title, e.company].filter(Boolean).join(' · '),
    fields: [T('title', 'Job title', 120, { half: true }), T('company', 'Company', 120, { half: true }), T('location', 'Location', 120), { type: 'daterange', current: 'I currently work here' },
      { key: 'description', label: 'Description', type: 'textarea', max: 2000, hint: 'Start a line with “- ” to turn it into a bullet point.' }, { key: 'bullets', label: 'Key achievements', type: 'bullets' }],
  },
  education: {
    addLabel: 'Add education', max: 50, itemName: 'education',
    blank: () => ({ degree: '', institution: '', location: '', startDate: '', endDate: '', grade: '', description: '' }),
    title: (e) => [e.degree, e.institution].filter(Boolean).join(' · '),
    fields: [T('degree', 'Degree', 160), T('institution', 'Institution', 160, { half: true }), T('location', 'Location', 120, { half: true }), { type: 'daterange' }, T('grade', 'Grade / GPA', 40, { half: true, placeholder: 'e.g. 3.7 / 4.0' }),
      { key: 'description', label: 'Description', type: 'textarea', max: 1500 }],
  },
  projects: {
    addLabel: 'Add project', max: 50, itemName: 'project',
    blank: () => ({ name: '', description: '', technologies: [], githubUrl: '', liveUrl: '', date: '', achievements: [] }),
    title: (e) => e.name,
    fields: [T('name', 'Project name', 140, { half: true }), M('date', 'Date'), { key: 'technologies', label: 'Technologies', type: 'tags', max: 30, tagMax: 40, placeholder: 'Type a technology and press Enter' },
      { key: 'githubUrl', label: 'GitHub URL', type: 'url', half: true }, { key: 'liveUrl', label: 'Live demo URL', type: 'url', half: true },
      { key: 'description', label: 'Description', type: 'textarea', max: 2000 }, { key: 'achievements', label: 'Key achievements', type: 'bullets' }],
  },
  certifications: {
    addLabel: 'Add certification', max: 50, itemName: 'certification',
    blank: () => ({ name: '', issuer: '', date: '', url: '' }),
    title: (e) => [e.name, e.issuer].filter(Boolean).join(' · '),
    fields: [T('name', 'Certification name', 160), T('issuer', 'Issuing organization', 160, { half: true }), M('date', 'Date'), { key: 'url', label: 'Credential URL', type: 'url' }],
  },
  achievements: {
    addLabel: 'Add achievement', max: 50, itemName: 'achievement',
    blank: () => ({ title: '', description: '', date: '' }),
    title: (e) => e.title,
    fields: [T('title', 'Title', 160, { half: true }), M('date', 'Date'), { key: 'description', label: 'Description', type: 'textarea', max: 1000 }],
  },
  languages: {
    addLabel: 'Add language', max: 30, itemName: 'language',
    blank: () => ({ language: '', proficiency: '' }),
    title: (e) => [e.language, e.proficiency].filter(Boolean).join(' · '),
    fields: [T('language', 'Language', 60, { half: true }), { key: 'proficiency', label: 'Proficiency', type: 'select', options: PROFICIENCY, half: true }],
  },
  volunteer: {
    addLabel: 'Add volunteer role', max: 50, itemName: 'role',
    blank: () => ({ role: '', organization: '', startDate: '', endDate: '', description: '' }),
    title: (e) => [e.role, e.organization].filter(Boolean).join(' · '),
    fields: [T('role', 'Role', 120, { half: true }), T('organization', 'Organization', 120, { half: true }), { type: 'daterange' }, { key: 'description', label: 'Description', type: 'textarea', max: 1500 }],
  },
  publications: {
    addLabel: 'Add publication', max: 50, itemName: 'publication',
    blank: () => ({ title: '', publisher: '', date: '', url: '' }),
    title: (e) => e.title,
    fields: [T('title', 'Title', 200), T('publisher', 'Publisher', 160, { half: true }), M('date', 'Date'), { key: 'url', label: 'URL', type: 'url' }],
  },
  awards: {
    addLabel: 'Add award', max: 50, itemName: 'award',
    blank: () => ({ title: '', issuer: '', date: '', description: '' }),
    title: (e) => e.title,
    fields: [T('title', 'Award', 160), T('issuer', 'Issuer', 160, { half: true }), M('date', 'Date'), { key: 'description', label: 'Description', type: 'textarea', max: 800 }],
  },
};

export const PERSONAL_FIELDS = [
  { key: 'fullName', label: 'Full name', max: 100, half: true, autoComplete: 'name' },
  { key: 'title', label: 'Professional title', max: 120, half: true, placeholder: 'e.g. Full-Stack Developer Intern' },
  { key: 'email', label: 'Email', max: 120, half: true, type: 'email', autoComplete: 'email' },
  { key: 'phone', label: 'Phone', max: 40, half: true, type: 'tel', autoComplete: 'tel' },
  { key: 'location', label: 'Location', max: 120, placeholder: 'City, Country' },
  { key: 'website', label: 'Website', max: 300, url: true, half: true },
  { key: 'portfolio', label: 'Portfolio', max: 300, url: true, half: true },
  { key: 'linkedin', label: 'LinkedIn', max: 300, url: true, half: true },
  { key: 'github', label: 'GitHub', max: 300, url: true, half: true },
];

export const DEFAULT_CUSTOMIZATION = {
  primaryColor: '#2563eb', accentColor: '#0ea5e9', fontFamily: 'auto', fontSize: 10, lineSpacing: 1.3,
  sectionSpacing: 16, margins: 40, headingStyle: 'auto', photoStyle: 'auto', density: 'comfortable', preset: 'professional',
};

export const PRESETS = [
  { id: 'professional', label: 'Professional', values: { ...DEFAULT_CUSTOMIZATION } },
  { id: 'minimal', label: 'Minimal', values: { ...DEFAULT_CUSTOMIZATION, primaryColor: '#111827', accentColor: '#6b7280', lineSpacing: 1.4, sectionSpacing: 20, margins: 52, density: 'spacious', headingStyle: 'plain' } },
  { id: 'modern', label: 'Modern', values: { ...DEFAULT_CUSTOMIZATION, primaryColor: '#7c3aed', accentColor: '#06b6d4', headingStyle: 'bar' } },
  { id: 'elegant', label: 'Elegant', values: { ...DEFAULT_CUSTOMIZATION, primaryColor: '#1e3a5f', accentColor: '#b08d57', fontFamily: 'Times-Roman', fontSize: 10.5, lineSpacing: 1.35, margins: 46, headingStyle: 'underline' } },
  { id: 'compact', label: 'Compact', values: { ...DEFAULT_CUSTOMIZATION, primaryColor: '#1f2937', accentColor: '#4b5563', fontSize: 9, lineSpacing: 1.15, sectionSpacing: 10, margins: 28, density: 'compact', headingStyle: 'caps' } },
];

export const COLOR_SWATCHES = ['#2563eb', '#7c3aed', '#0f766e', '#be123c', '#c2410c', '#1e3a5f', '#111827', '#475569'];
export const FONT_OPTIONS = [
  { value: 'auto', label: 'Template default' }, { value: 'Helvetica', label: 'Sans-serif (Inter)' },
  { value: 'Times-Roman', label: 'Serif (Lora)' }, { value: 'Courier', label: 'Monospace (Source Code Pro)' },
];
export const HEADING_STYLES = [{ value: 'auto', label: 'Auto' }, { value: 'underline', label: 'Underline' }, { value: 'bar', label: 'Bar' }, { value: 'caps', label: 'Caps' }, { value: 'plain', label: 'Plain' }];
export const PHOTO_STYLES = [{ value: 'auto', label: 'Auto' }, { value: 'circle', label: 'Circle' }, { value: 'rounded', label: 'Rounded' }, { value: 'square', label: 'Square' }, { value: 'none', label: 'None' }];
export const DENSITIES = [{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfortable' }, { value: 'spacious', label: 'Spacious' }];

/** Shown in the template picker when a resume has no content yet. */
export const SAMPLE_CONTENT = {
  summary: 'Computer science student with hands-on experience building full-stack web applications. Quick learner who enjoys turning ideas into polished, working products.',
  experience: [{ _id: 'a00000000000000000000001', title: 'Software Engineering Intern', company: 'Acme Labs', location: 'Remote', startDate: '2025-06', endDate: '2025-09', current: false, description: 'Built and shipped features across a React and Node.js codebase.\n- Cut page load time by 35%\n- Wrote unit tests for core flows', bullets: [] }],
  education: [{ _id: 'a00000000000000000000002', degree: 'B.Sc. Computer Science', institution: 'University of Technology', location: '', startDate: '2022-09', endDate: '2026-06', grade: '3.7 / 4.0', description: '' }],
  skills: [['React', 'Frontend'], ['TypeScript', 'Frontend'], ['Node.js', 'Backend'], ['MongoDB', 'Database']].map(([name, category], i) => ({ _id: `a0000000000000000000010${i}`, name, category, level: 'Advanced', tags: [] })),
  projects: [{ _id: 'a00000000000000000000003', name: 'Task Tracker', description: 'A collaborative task board with real-time updates.', technologies: ['React', 'Express', 'MongoDB'], githubUrl: 'https://github.com/example/task-tracker', liveUrl: '', date: '2025-03', achievements: [] }],
  enabledSections: ['summary', 'experience', 'education', 'skills', 'projects'],
};
