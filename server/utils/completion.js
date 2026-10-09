/**
 * Resume completion score (0-100) plus actionable suggestions.
 * Weights: personal 25, summary 15, experience 20, education 15, skills 15, projects 10.
 */
const filled = (v) => typeof v === 'string' && v.trim().length > 0;

function calculateCompletion(resume) {
  const p = resume.personalInfo || {};
  const suggestions = [];
  let score = 0;

  const core = ['fullName', 'title', 'email', 'phone', 'location'].filter((k) => filled(p[k])).length;
  score += core * 3;
  if (core < 5) suggestions.push('Complete your name, title, email, phone and location');

  const hasLink = ['linkedin', 'github', 'website', 'portfolio'].some((k) => filled(p[k]));
  const linkedin = filled(p.linkedin);
  score += (linkedin ? 5 : 0) + (hasLink ? 5 : 0);
  if (!linkedin) suggestions.push('Add your LinkedIn profile');
  if (!hasLink) suggestions.push('Add a GitHub, website or portfolio link');

  const summaryLen = (resume.summary || '').trim().length;
  score += summaryLen >= 100 ? 15 : summaryLen > 0 ? 8 : 0;
  if (summaryLen === 0) suggestions.push('Add a professional summary');
  else if (summaryLen < 100) suggestions.push('Expand your summary to at least 100 characters');

  const exp = (resume.experience || []).filter((e) => filled(e.title) && filled(e.company)).length;
  score += exp >= 1 ? 20 : 0;
  if (!exp) suggestions.push('Add at least one work or internship experience');

  const edu = (resume.education || []).filter((e) => filled(e.degree) && filled(e.institution)).length;
  score += edu >= 1 ? 15 : 0;
  if (!edu) suggestions.push('Add your education');

  const skills = (resume.skills || []).filter((s) => filled(s.name)).length;
  score += skills >= 3 ? 15 : skills > 0 ? 7 : 0;
  if (skills < 3) suggestions.push('Add at least 3 skills');

  const projects = (resume.projects || []).filter((x) => filled(x.name));
  score += projects.length >= 1 ? 10 : 0;
  if (!projects.length) suggestions.push('Add a project');
  else if (!projects.some((x) => filled(x.githubUrl) || filled(x.liveUrl))) {
    suggestions.push('Add project links (GitHub or live demo)');
  }

  return { percent: Math.min(100, score), suggestions: suggestions.slice(0, 5) };
}

module.exports = { calculateCompletion };
