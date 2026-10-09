const { z } = require('zod');
const { TEMPLATES, SECTION_KEYS } = require('../models/Resume');

const str = (max = 500) => z.string().trim().max(max).default('');
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #2563eb');
const url = z.string().trim().max(300).refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), 'Must start with http:// or https://').default('');
const arr = (shape, max = 50) => z.array(shape).max(max);
const idField = { _id: z.string().optional() };

const experience = z.object({ ...idField, title: str(120), company: str(120), location: str(120), startDate: str(30), endDate: str(30), current: z.boolean().default(false), description: str(2000), bullets: arr(str(400), 20).default([]) });
const education = z.object({ ...idField, degree: str(160), institution: str(160), location: str(120), startDate: str(30), endDate: str(30), grade: str(40), description: str(1500) });
const skill = z.object({ ...idField, name: str(80), category: str(60), level: z.enum(['', 'Beginner', 'Intermediate', 'Advanced', 'Expert']).default(''), tags: arr(str(40), 20).default([]) });
const project = z.object({ ...idField, name: str(140), description: str(2000), technologies: arr(str(40), 30).default([]), githubUrl: url, liveUrl: url, date: str(30), achievements: arr(str(400), 20).default([]) });
const certification = z.object({ ...idField, name: str(160), issuer: str(160), date: str(30), url });
const achievement = z.object({ ...idField, title: str(160), description: str(1000), date: str(30) });
const language = z.object({ ...idField, language: str(60), proficiency: str(40) });
const volunteer = z.object({ ...idField, role: str(120), organization: str(120), startDate: str(30), endDate: str(30), description: str(1500) });
const publication = z.object({ ...idField, title: str(200), publisher: str(160), date: str(30), url });
const award = z.object({ ...idField, title: str(160), description: str(800), issuer: str(160), date: str(30) });

const personalInfo = z.object({
  fullName: str(100), title: str(120),
  email: z.string().trim().max(120).refine((v) => v === '' || /^\S+@\S+\.\S+$/.test(v), 'Invalid email').default(''),
  phone: str(40), location: str(120), website: url, linkedin: url, github: url, portfolio: url, photo: str(500),
});

const customization = z.object({
  primaryColor: hex, accentColor: hex,
  fontFamily: z.enum(['auto', 'Helvetica', 'Times-Roman', 'Courier']),
  fontSize: z.number().min(8).max(14),
  lineSpacing: z.number().min(1).max(2),
  sectionSpacing: z.number().min(6).max(40),
  margins: z.number().min(20).max(80),
  headingStyle: z.enum(['auto', 'underline', 'bar', 'caps', 'plain']),
  photoStyle: z.enum(['auto', 'circle', 'rounded', 'square', 'none']),
  density: z.enum(['compact', 'comfortable', 'spacious']),
  preset: z.string().max(40),
}).partial();

const sectionKey = z.enum(SECTION_KEYS);
const unique = (a) => new Set(a).size === a.length;

const fields = {
  name: z.string().trim().min(1, 'Resume name is required').max(100),
  template: z.enum(TEMPLATES),
  personalInfo,
  summary: str(1500),
  experience: arr(experience), education: arr(education), skills: arr(skill, 100), projects: arr(project),
  certifications: arr(certification), achievements: arr(achievement), languages: arr(language, 30),
  volunteer: arr(volunteer), interests: arr(str(80), 40), publications: arr(publication), awards: arr(award),
  enabledSections: arr(sectionKey, 12).refine(unique, 'Duplicate sections'),
  sectionOrder: arr(sectionKey, 12).refine(unique, 'Duplicate sections'),
  customization,
};

exports.createResumeSchema = z.object(fields).partial();
exports.updateResumeSchema = z
  .object(fields)
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update');
exports.listQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  template: z.enum(TEMPLATES).optional(),
  sort: z.enum(['updated', 'created', 'name', 'completion']).default('updated'),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});
