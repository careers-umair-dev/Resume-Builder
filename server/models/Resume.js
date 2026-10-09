const mongoose = require('mongoose');
const { calculateCompletion } = require('../utils/completion');

const { Schema } = mongoose;
const S = (max = 500) => ({ type: String, trim: true, maxlength: max, default: '' });

const TEMPLATES = ['modern-professional', 'minimal-executive', 'creative-developer', 'elegant-corporate', 'compact-ats', 'classic-professional'];
const SECTION_KEYS = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'achievements', 'languages', 'volunteer', 'interests', 'publications', 'awards'];
const OPTIONAL_SECTIONS = ['certifications', 'achievements', 'languages', 'volunteer', 'interests', 'publications', 'awards'];

const experience = new Schema({
  title: S(120), company: S(120), location: S(120),
  startDate: S(30), endDate: S(30), current: { type: Boolean, default: false },
  description: S(2000), bullets: [S(400)],
});
const education = new Schema({
  degree: S(160), institution: S(160), location: S(120),
  startDate: S(30), endDate: S(30), grade: S(40), description: S(1500),
});
const skill = new Schema({
  name: S(80), category: S(60),
  level: { type: String, enum: ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'], default: '' },
  tags: [S(40)],
});
const project = new Schema({
  name: S(140), description: S(2000), technologies: [S(40)],
  githubUrl: S(300), liveUrl: S(300), date: S(30), achievements: [S(400)],
});
const certification = new Schema({ name: S(160), issuer: S(160), date: S(30), url: S(300) });
const achievement = new Schema({ title: S(160), description: S(1000), date: S(30) });
const language = new Schema({ language: S(60), proficiency: S(40) });
const volunteer = new Schema({
  role: S(120), organization: S(120), startDate: S(30), endDate: S(30), description: S(1500),
});
const publication = new Schema({ title: S(200), publisher: S(160), date: S(30), url: S(300) });
const award = new Schema({ title: S(160), issuer: S(160), date: S(30), description: S(800) });

const customization = new Schema(
  {
    primaryColor: { type: String, default: '#2563eb', match: /^#[0-9a-fA-F]{6}$/ },
    accentColor: { type: String, default: '#0ea5e9', match: /^#[0-9a-fA-F]{6}$/ },
    fontFamily: { type: String, enum: ['auto', 'Helvetica', 'Times-Roman', 'Courier'], default: 'auto' },
    fontSize: { type: Number, min: 8, max: 14, default: 10 },
    lineSpacing: { type: Number, min: 1, max: 2, default: 1.3 },
    sectionSpacing: { type: Number, min: 6, max: 40, default: 16 },
    margins: { type: Number, min: 20, max: 80, default: 40 },
    headingStyle: { type: String, enum: ['auto', 'underline', 'bar', 'caps', 'plain'], default: 'auto' },
    photoStyle: { type: String, enum: ['auto', 'circle', 'rounded', 'square', 'none'], default: 'auto' },
    density: { type: String, enum: ['compact', 'comfortable', 'spacious'], default: 'comfortable' },
    preset: { type: String, default: 'professional' },
  },
  { _id: false }
);

const resumeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100, default: 'Untitled Resume' },
    template: { type: String, enum: TEMPLATES, default: TEMPLATES[0] },
    personalInfo: {
      fullName: S(100), title: S(120), email: S(120), phone: S(40), location: S(120),
      website: S(300), linkedin: S(300), github: S(300), portfolio: S(300), photo: S(500),
    },
    summary: S(1500),
    experience: [experience],
    education: [education],
    skills: [skill],
    projects: [project],
    certifications: [certification],
    achievements: [achievement],
    languages: [language],
    volunteer: [volunteer],
    interests: [S(80)],
    publications: [publication],
    awards: [award],
    enabledSections: { type: [String], enum: SECTION_KEYS, default: ['summary', 'experience', 'education', 'skills', 'projects'] },
    sectionOrder: { type: [String], enum: SECTION_KEYS, default: SECTION_KEYS },
    customization: { type: customization, default: () => ({}) },
    completion: {
      percent: { type: Number, default: 0 },
      suggestions: { type: [String], default: [] },
    },
    downloadHistory: [{ _id: false, at: { type: Date, default: Date.now }, template: String }],
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, updatedAt: -1 });
resumeSchema.index({ user: 1, name: 1 });

resumeSchema.pre('validate', function score(next) {
  this.completion = calculateCompletion(this);
  next();
});

resumeSchema.set('toJSON', {
  transform: (_doc, ret) => { delete ret.__v; return ret; },
});

module.exports = mongoose.model('Resume', resumeSchema);
module.exports.TEMPLATES = TEMPLATES;
module.exports.SECTION_KEYS = SECTION_KEYS;
module.exports.OPTIONAL_SECTIONS = OPTIONAL_SECTIONS;
