export const APP_NAME = 'Resumify';
export const TOKEN_KEY = 'rb_token';
export const THEME_KEY = 'rb_theme';
export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || '';
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export const TEMPLATES = [
  { id: 'modern-professional', name: 'Modern Professional', variant: 'banner', blurb: 'Bold header band with clean sections' },
  { id: 'minimal-executive', name: 'Minimal Executive', variant: 'minimal', blurb: 'Quiet, spacious and confident' },
  { id: 'creative-developer', name: 'Creative Developer', variant: 'sidebar', blurb: 'Sidebar layout with skill bars' },
  { id: 'elegant-corporate', name: 'Elegant Corporate', variant: 'split', blurb: 'Serif type with a split header' },
  { id: 'compact-ats', name: 'Compact ATS', variant: 'ats', blurb: 'Dense, monochrome, parser-friendly' },
  { id: 'classic-professional', name: 'Classic Professional', variant: 'classic', blurb: 'Traditional, centered, dates on the left' },
];
