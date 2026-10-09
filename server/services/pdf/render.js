const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ApiError = require('../../utils/ApiError');
const Cursor = require('./cursor');
const { loadFace, CUSTOM_TO_KEY } = require('./fonts');
const { TEMPLATES, DEFAULT_TEMPLATE } = require('./templates');
const { clean, dateRange, withProtocol, displayUrl, splitDescription, mix, luminance } = require('./text');

const W = 595.28;
const H = 841.89;
const FOOTER = 14;
const UPLOADS = path.join(__dirname, '../../uploads');
const LABELS = { summary: 'Summary', experience: 'Experience', education: 'Education', skills: 'Skills', projects: 'Projects', certifications: 'Certifications', achievements: 'Achievements', languages: 'Languages', volunteer: 'Volunteer Experience', interests: 'Interests', publications: 'Publications', awards: 'Awards' };
const LEVEL = { Beginner: 0.3, Intermediate: 0.55, Advanced: 0.8, Expert: 1 };
const DOTS = { Beginner: 2, Intermediate: 3, Advanced: 4, Expert: 5 };

function resolveTheme(resume, tpl) {
  const c = resume.customization || {};
  const dens = { compact: 0.78, comfortable: 1, spacious: 1.25 }[c.density || 'comfortable'] * tpl.spacing;
  const pick = (v, d) => (v && v !== 'auto' ? v : d);
  return {
    primary: tpl.monochrome ? '#111827' : c.primaryColor || '#2563eb',
    accent: tpl.monochrome ? '#374151' : c.accentColor || '#0ea5e9',
    text: '#1f2937', muted: '#6b7280',
    size: (c.fontSize || 10) * tpl.sizeScale, ls: c.lineSpacing || 1.3,
    secGap: (c.sectionSpacing || 16) * dens, itemGap: 7 * dens,
    margin: Math.max(20, (c.margins || 40) * tpl.marginScale),
    headingStyle: pick(c.headingStyle, tpl.headingStyle),
    photoStyle: tpl.monochrome ? 'none' : pick(c.photoStyle, tpl.photo),
    fontKey: pick(CUSTOM_TO_KEY[c.fontFamily], tpl.font),
  };
}

function build(doc, resume) {
  const tpl = TEMPLATES[resume.template] || TEMPLATES[DEFAULT_TEMPLATE];
  const theme = resolveTheme(resume, tpl);
  const faces = loadFace(doc, theme.fontKey);
  const emb = faces.embedded;
  const p = resume.personalInfo || {};
  const m = theme.margin;
  const bottom = H - m - FOOTER;
  const lineGap = (size) => Math.max(-0.1 * size, (theme.ls - 1.25) * size);

  // ---------- primitives (each returns an op {h, draw(x, y)}) ----------
  const widthOf = (s, font, size) => doc.font(faces[font || 'regular']).fontSize(size).widthOfString(s);
  const gap = (h) => ({ h, draw() {} });
  const shift = (op, dx) => op && { h: op.h, draw: (x, y) => op.draw(x + dx, y) };

  const text = (str, o = {}) => {
    let s = clean(str, emb);
    if (!s) return null;
    if (o.upper) s = s.toUpperCase();
    const size = o.size || theme.size;
    const f = faces[o.font || 'regular'];
    const opts = { width: o.w, align: o.align || 'left', lineGap: lineGap(size), characterSpacing: o.cs || 0 };
    doc.font(f).fontSize(size);
    const h = doc.heightOfString(s, opts);
    return {
      h,
      draw: (x, y) => doc.font(f).fontSize(size).fillColor(o.color || theme.text).text(s, x + (o.dx || 0), y, { ...opts, link: o.link, underline: !!o.underline }),
    };
  };

  const row = (left, right, w) => {
    const rs = clean(right && right.text, emb);
    const rw = rs ? widthOf(rs, right.font, right.size) + 4 : 0;
    const l = text(left.text, { ...left, w: w - (rw ? rw + 10 : 0) });
    const r = rs ? text(rs, { ...right, w: rw, align: 'right' }) : null;
    if (!l && !r) return null;
    return { h: Math.max(l ? l.h : 0, r ? r.h : 0), draw: (x, y) => { if (l) l.draw(x, y); if (r) r.draw(x + w - rw, y); } };
  };

  const bullet = (str, o) => {
    const size = o.size || theme.size;
    const t = text(str, { ...o, w: o.w - 12, dx: 12 });
    if (!t) return null;
    return {
      h: t.h,
      draw: (x, y) => {
        t.draw(x + (o.dx || 0), y);
        const bx = x + (o.dx || 0); const cy = y + size * 0.62;
        doc.fillColor(o.bulletColor || theme.primary);
        if (tpl.bullet === 'square') doc.rect(bx + 1.5, cy - 1.5, 3, 3).fill();
        else if (tpl.bullet === 'dash') doc.rect(bx + 1, cy - 0.4, 5, 0.8).fill();
        else doc.circle(bx + 3, cy, 1.5).fill();
      },
    };
  };

  /** Wrapping row(s) of items: chips or separator-joined text. Returns one op per line. */
  const flow = (items, o) => {
    const size = o.size || theme.size; const padX = 5; const padY = 2.2; const f = faces.regular;
    doc.font(f).fontSize(size);
    const sepW = o.sep ? doc.widthOfString(o.sep) : 0;
    const between = o.chip ? 5 : sepW;
    const its = items.map((i) => {
      let t = clean(i.text, emb);
      const extra = o.chip ? padX * 2 : 0;
      while (t.length > 3 && doc.widthOfString(t) + extra > o.w) t = `${t.slice(0, -2)}…`;
      return { ...i, t, w: t ? doc.widthOfString(t) + extra : 0 };
    }).filter((i) => i.t);
    const lines = []; let cur = []; let cw = 0;
    its.forEach((i) => {
      const need = cur.length ? cw + between + i.w : i.w;
      if (cur.length && need > o.w) { lines.push({ items: cur, w: cw }); cur = [i]; cw = i.w; } else { cur.push(i); cw = need; }
    });
    if (cur.length) lines.push({ items: cur, w: cw });
    const lh = size * 1.25 + (o.chip ? padY * 2 + 3 : 2);
    return lines.map((L) => ({
      h: lh,
      draw: (x, y) => {
        let px = x + (o.dx || 0) + (o.align === 'center' ? (o.w - L.w) / 2 : o.align === 'right' ? o.w - L.w : 0);
        L.items.forEach((i, k) => {
          if (k) {
            if (o.chip) px += 5;
            else { doc.font(f).fontSize(size).fillColor(o.sepColor || theme.muted).text(o.sep, px, y, { lineBreak: false }); px += sepW; }
          }
          if (o.chip) {
            doc.roundedRect(px, y, i.w, size + padY * 2, 3).fill(o.chipBg);
            doc.font(f).fontSize(size).fillColor(o.chipFg).text(i.t, px + padX, y + padY, { lineBreak: false });
          } else {
            doc.font(f).fontSize(size).fillColor(i.color || o.color || theme.text).text(i.t, px, y, { width: i.w + 4, link: i.link, underline: !!(i.link && o.underline) });
          }
          px += i.w;
        });
      },
    }));
  };

  const heading = (label, w, st) => {
    const style = theme.headingStyle; const caps = style === 'caps' || tpl.headingCaps;
    const color = st.heading;
    const size = style === 'caps' ? theme.size * 0.95 : theme.size * 1.15;
    const t = text(label, { font: 'bold', size, color, w: w - (style === 'bar' ? 9 : 0), upper: caps, cs: caps ? 1.1 : 0, dx: style === 'bar' ? 9 : 0 });
    const rule = st.rule || color;
    if (style === 'underline') return { h: t.h + 7, draw: (x, y) => { t.draw(x, y); doc.rect(x, y + t.h + 2.5, w, 0.8).fill(rule); } };
    if (style === 'caps') return { h: t.h + 7, draw: (x, y) => { t.draw(x, y); doc.rect(x, y + t.h + 2.5, w, 0.4).fill(st.hair); } };
    if (style === 'bar') return { h: t.h + 4, draw: (x, y) => { doc.rect(x, y + 1, 3, t.h - 2).fill(st.accent); t.draw(x, y); } };
    return { h: t.h + 4, draw: (x, y) => t.draw(x, y) };
  };

  // ---------- entries ----------
  const entry = (e, w, st) => {
    const size = theme.size;
    const mode = w < 250 ? 'below' : tpl.dateMode === 'left-col' ? 'left-col' : 'right';
    const dw = mode === 'left-col' ? 86 : 0;
    const cw = w - dw;
    const ops = [];
    if (mode === 'right') ops.push(row({ text: e.title, font: 'bold', size: size * 1.02, color: st.text }, { text: e.date, color: st.muted, size: size * 0.92 }, cw));
    else ops.push(text(e.title, { font: 'bold', size: size * 1.02, color: st.text, w: cw }));
    ops.push(text(e.sub, { color: st.muted, w: cw }));
    if (mode === 'below') ops.push(text(e.date, { color: st.muted, size: size * 0.9, w: cw }));
    const d = splitDescription(e.desc);
    d.paragraphs.forEach((t) => ops.push(text(t, { color: st.text, w: cw })));
    [...d.bullets, ...(e.bullets || [])].forEach((b) => ops.push(bullet(b, { color: st.text, w: cw, bulletColor: st.accent })));
    if (e.links && e.links.length) ops.push(...flow(e.links, { w: cw, size: size * 0.92, sep: '   ', color: st.accent, underline: true }));
    let list = ops.filter(Boolean);
    if (!list.length) return null;
    if (mode === 'left-col') {
      const dop = text(e.date, { color: st.muted, size: size * 0.92, w: dw - 10 });
      list = list.map((o, i) => (i === 0 ? { h: o.h, draw: (x, y) => { if (dop) dop.draw(x, y); o.draw(x + dw, y); } } : shift(o, dw)));
    }
    list.push(gap(theme.itemGap));
    return list;
  };

  const entries = (arr, map, w, st) => (arr || []).map((x) => entry(map(x), w, st)).filter(Boolean);
  const link = (label, url) => (url ? { text: label, link: withProtocol(url) } : null);

  const skillsOps = (w, st) => {
    const groups = new Map();
    (resume.skills || []).forEach((s) => {
      const n = clean(s.name, emb); if (!n) return;
      const k = clean(s.category, emb);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push({ name: n, level: s.level, tags: (s.tags || []).map((t) => clean(t, emb)).filter(Boolean) });
    });
    if (!groups.size) return [];
    const style = tpl.skills; const size = theme.size; const out = [];
    const names = (g) => g.flatMap((s) => [s.name, ...s.tags]);
    if (style === 'bars' || style === 'dots') {
      const all = [...groups.values()].flat();
      if (style === 'bars') {
        all.forEach((s) => {
          const t = text(s.name, { w, color: st.text, size: size * 0.95 });
          const frac = LEVEL[s.level] || 0.6;
          out.push({ h: t.h + 6, draw: (x, y) => { t.draw(x, y); doc.roundedRect(x, y + t.h + 1, w, 3, 1.5).fill(st.track); doc.roundedRect(x, y + t.h + 1, w * frac, 3, 1.5).fill(st.bar); } });
        });
        return [out];
      }
      const cw = (w - 18) / 2;
      for (let i = 0; i < all.length; i += 2) {
        const cells = all.slice(i, i + 2).map((s, k) => {
          const dots = DOTS[s.level] || 0;
          const t = text(s.name, { w: cw - (dots ? 44 : 0), color: st.text });
          return { t, dots, dx: k * (cw + 18) };
        });
        const h = Math.max(...cells.map((c) => c.t.h)) + 2;
        out.push({ h, draw: (x, y) => cells.forEach((c) => { c.t.draw(x + c.dx, y); if (c.dots) for (let d = 0; d < 5; d += 1) doc.circle(x + c.dx + cw - 40 + d * 9 + 3, y + size * 0.6, 2.2).fill(d < c.dots ? st.accent : st.track); }) });
      }
      return [out];
    }
    [...groups.entries()].forEach(([cat, g]) => {
      const ops = [];
      if (style === 'chips') {
        if (cat) ops.push(text(cat, { font: 'bold', size: size * 0.9, color: st.muted, w }), gap(2));
        ops.push(...flow(names(g).map((t) => ({ text: t })), { w, chip: true, chipBg: st.chipBg, chipFg: st.chipFg, size: size * 0.95 }), gap(3));
      } else if (style === 'grouped') {
        if (cat) ops.push(text(cat, { font: 'bold', color: st.heading, w }));
        ops.push(text(names(g).join(', '), { w, color: st.text }), gap(3));
      } else {
        const body = names(g).join(cat ? ', ' : '  ·  ');
        if (cat) {
          const label = `${cat}: `;
          doc.font(faces.bold).fontSize(size);
          const h = doc.heightOfString(label + body, { width: w, lineGap: lineGap(size) });
          ops.push({ h, draw: (x, y) => { doc.font(faces.bold).fontSize(size).fillColor(st.text).text(label, x, y, { width: w, continued: true, lineGap: lineGap(size) }); doc.font(faces.regular).fillColor(st.text).text(body, { width: w, lineGap: lineGap(size) }); } }, gap(2));
        } else ops.push(text(body, { w, color: st.text }));
      }
      out.push(ops);
    });
    return out;
  };

  const sectionItems = (key, w, st) => {
    switch (key) {
      case 'summary': { const t = text(resume.summary, { w, color: st.text }); return t ? [[t]] : []; }
      case 'experience': return entries(resume.experience, (e) => ({ title: e.title, sub: [e.company, e.location].filter(Boolean).join(' · '), date: dateRange(e.startDate, e.endDate, e.current), desc: e.description, bullets: e.bullets }), w, st);
      case 'education': return entries(resume.education, (e) => ({ title: e.degree, sub: [e.institution, e.location, e.grade && `Grade: ${e.grade}`].filter(Boolean).join(' · '), date: dateRange(e.startDate, e.endDate), desc: e.description }), w, st);
      case 'projects': return entries(resume.projects, (e) => ({ title: e.name, sub: (e.technologies || []).filter(Boolean).join(' · '), date: dateRange(e.date), desc: e.description, bullets: e.achievements, links: [link('GitHub', e.githubUrl), link('Live demo', e.liveUrl)].filter(Boolean) }), w, st);
      case 'certifications': return entries(resume.certifications, (e) => ({ title: e.name, sub: e.issuer, date: dateRange(e.date), links: [link('Credential', e.url)].filter(Boolean) }), w, st);
      case 'achievements': return entries(resume.achievements, (e) => ({ title: e.title, date: dateRange(e.date), desc: e.description }), w, st);
      case 'awards': return entries(resume.awards, (e) => ({ title: e.title, sub: e.issuer, date: dateRange(e.date), desc: e.description }), w, st);
      case 'volunteer': return entries(resume.volunteer, (e) => ({ title: e.role, sub: e.organization, date: dateRange(e.startDate, e.endDate), desc: e.description }), w, st);
      case 'publications': return entries(resume.publications, (e) => ({ title: e.title, sub: e.publisher, date: dateRange(e.date), links: [link('Read', e.url)].filter(Boolean) }), w, st);
      case 'skills': return skillsOps(w, st);
      case 'languages': {
        const ls = (resume.languages || []).filter((l) => clean(l.language, emb));
        if (!ls.length) return [];
        if (w < 250) return [ls.map((l) => row({ text: l.language, color: st.text }, { text: l.proficiency, color: st.muted, size: theme.size * 0.9 }, w))];
        return [flow(ls.map((l) => ({ text: l.proficiency ? `${l.language} (${l.proficiency})` : l.language })), { w, sep: '  ·  ', color: st.text })];
      }
      case 'interests': {
        const it = (resume.interests || []).map((t) => ({ text: t })).filter((i) => clean(i.text, emb));
        if (!it.length) return [];
        const chip = tpl.skills === 'chips' || tpl.skills === 'bars';
        return [flow(it, chip ? { w, chip: true, chipBg: st.chipBg, chipFg: st.chipFg, size: theme.size * 0.95 } : { w, sep: '  ·  ', color: st.text })];
      }
      default: return [];
    }
  };

  let placed = 0;
  const renderSection = (col, key, st) => {
    const items = sectionItems(key, col.w, st).filter((i) => i && i.length);
    if (!items.length) return;
    placed += 1;
    col.space(theme.secGap);
    col.block([heading(LABELS[key], col.w, st), gap(1), ...items[0]]);
    for (let i = 1; i < items.length; i += 1) col.block(items[i]);
  };

  // ---------- palettes ----------
  const light = { text: theme.text, muted: theme.muted, heading: theme.primary, accent: theme.primary, hair: '#d1d5db', chipBg: mix(theme.primary, '#ffffff', 0.88), chipFg: theme.primary, bar: theme.primary, track: '#e5e7eb' };
  const onColor = (bg) => (luminance(bg) > 0.45 ? '#111827' : '#ffffff');

  // ---------- photo + contact ----------
  const photoFile = (() => {
    const raw = p.photo;
    if (!raw || /^https?:/i.test(raw) || theme.photoStyle === 'none') return null;
    const f = path.join(UPLOADS, path.basename(raw));
    return /\.(jpe?g|png)$/i.test(f) && fs.existsSync(f) ? f : null;
  })();
  const drawPhoto = (x, y, s) => {
    if (!photoFile) return;
    try {
      doc.save();
      if (theme.photoStyle === 'circle') doc.circle(x + s / 2, y + s / 2, s / 2).clip();
      else if (theme.photoStyle === 'rounded') doc.roundedRect(x, y, s, s, s * 0.18).clip();
      else doc.rect(x, y, s, s).clip();
      doc.image(photoFile, x, y, { cover: [s, s], align: 'center', valign: 'center' });
      doc.restore();
    } catch (err) { try { doc.restore(); } catch (e) { /* noop */ } }
  };
  const contactItems = () => {
    const seen = new Set();
    return [
      p.email && { text: p.email, link: `mailto:${p.email}` }, p.phone && { text: p.phone }, p.location && { text: p.location },
      ...['website', 'portfolio', 'linkedin', 'github'].filter((k) => p[k]).map((k) => ({ text: displayUrl(p[k]), link: withProtocol(p[k]) })),
    ].filter((i) => i && clean(i.text, emb) && !seen.has(i.text) && seen.add(i.text));
  };

  const drawOps = (ops, x, y) => ops.filter(Boolean).reduce((yy, o) => { o.draw(x, yy); return yy + o.h; }, y);
  const sumH = (ops) => ops.filter(Boolean).reduce((s, o) => s + o.h, 0);

  // ---------- headers (page 1) ----------
  const nameOp = (w, o = {}) => text(p.fullName, { font: 'bold', size: tpl.nameSize, w, ...o });
  const header = () => {
    const inner = W - 2 * m; const ps = photoFile ? 72 : 0;
    if (tpl.header === 'banner') {
      const tw = inner - (ps ? ps + 16 : 0); const on = onColor(theme.primary);
      const ops = [nameOp(tw, { color: on }), text(p.title, { size: theme.size * 1.25, color: mix(on, theme.primary, 0.15), w: tw }), gap(6),
        ...flow(contactItems(), { w: tw, sep: '  ·  ', size: theme.size * 0.92, color: mix(on, theme.primary, 0.1), sepColor: mix(on, theme.primary, 0.45) })];
      const h = Math.max(sumH(ops), ps) + m * 1.3;
      doc.rect(0, 0, W, h).fill(theme.primary);
      drawOps(ops, m, m * 0.8); drawPhoto(W - m - ps, m * 0.8, ps);
      return h + theme.secGap * 0.6;
    }
    if (tpl.header === 'centered') {
      const ops = [photoFile ? gap(0) : null, nameOp(inner, { align: 'center', cs: 1, upper: true, size: tpl.nameSize * 0.92 }), text(p.title, { align: 'center', color: theme.primary, size: theme.size * 1.2, w: inner }), gap(5),
        ...flow(contactItems(), { w: inner, align: 'center', sep: '  |  ', color: theme.text, size: theme.size * 0.95 })];
      const y = drawOps(ops, m, m); doc.rect(m, y + 2, inner, 1.2).fill(theme.primary);
      return y + 2 + theme.secGap * 0.6;
    }
    if (tpl.header === 'split') {
      const lw = inner * 0.56 - (ps ? ps + 14 : 0); const rw = inner * 0.4;
      const left = [nameOp(lw), text(p.title, { color: theme.primary, size: theme.size * 1.2, w: lw })];
      const right = contactItems().map((i) => text(i.text, { w: rw, align: 'right', link: i.link, size: theme.size * 0.95, color: theme.text }));
      const h = Math.max(sumH(left), sumH(right), ps);
      drawPhoto(m, m, ps); drawOps(left, m + (ps ? ps + 14 : 0), m); drawOps(right, m + inner - rw, m);
      doc.rect(m, m + h + 6, inner, 2).fill(theme.primary);
      return m + h + 8 + theme.secGap * 0.5;
    }
    if (tpl.header === 'main-name') return null; // handled by sidebar layout
    const tw = inner - (ps ? ps + 14 : 0); // 'left'
    const ops = [nameOp(tw), text(p.title, { color: theme.primary, size: theme.size * 1.2, w: tw }), gap(4), ...flow(contactItems(), { w: tw, sep: '   ·   ', size: theme.size * 0.95, color: theme.text })];
    const h = Math.max(sumH(ops), ps); drawOps(ops, m, m); drawPhoto(W - m - ps, m, ps);
    doc.rect(m, m + h + 4, inner, 0.6).fill('#9ca3af');
    return m + h + 4 + theme.secGap * 0.7;
  };

  // ---------- layout ----------
  const enabled = new Set(resume.enabledSections || []);
  const order = [...(resume.sectionOrder || []), ...Object.keys(LABELS)].filter((k, i, a) => a.indexOf(k) === i && enabled.has(k));

  if (tpl.layout === 'sidebar-left') {
    const sw = tpl.sidebar.width; const pad = 18;
    const sbBg = tpl.sidebar.bg === 'primary' ? theme.primary : mix(theme.primary, '#ffffff', 0.9);
    const sbText = onColor(sbBg); const dark = sbText === '#ffffff';
    const sbSt = dark
      ? { text: sbText, muted: mix('#ffffff', sbBg, 0.35), heading: '#ffffff', rule: mix('#ffffff', sbBg, 0.55), accent: '#ffffff', hair: mix('#ffffff', sbBg, 0.7), chipBg: mix(sbBg, '#ffffff', 0.18), chipFg: '#ffffff', bar: '#ffffff', track: mix(sbBg, '#ffffff', 0.25) }
      : light;
    const paintBg = () => doc.rect(0, 0, sw, H).fill(sbBg);
    paintBg();
    doc.on('pageAdded', paintBg);

    const side = new Cursor(doc, { x: pad, w: sw - 2 * pad, top: m, bottom: H - m });
    const mainX = sw + 26;
    const main = new Cursor(doc, { x: mainX, w: W - mainX - m, top: m, bottom });

    if (photoFile) { side.block([{ h: 100, draw: (x, y) => drawPhoto(x + (side.w - 90) / 2, y, 90) }]); }
    const contact = contactItems().map((i) => text(i.text, { w: side.w, color: sbSt.text, link: i.link, size: theme.size * 0.92 }));
    if (contact.length) {
      side.space(theme.secGap);
      side.block([heading('Contact', side.w, sbSt), gap(2), ...contact.flatMap((c) => [c, gap(3)])]);
    }
    const sideKeys = order.filter((k) => tpl.sidebar.sections.includes(k));
    sideKeys.forEach((k) => renderSection(side, k, sbSt));

    main.block([nameOp(main.w), text(p.title, { color: theme.primary, size: theme.size * 1.3, w: main.w }), gap(6), { h: 4, draw: (x, y) => doc.rect(x, y, 36, 3).fill(theme.accent) }]);
    order.filter((k) => !tpl.sidebar.sections.includes(k)).forEach((k) => renderSection(main, k, light));
  } else {
    const top = header();
    const main = new Cursor(doc, { x: m, w: W - 2 * m, top: m, bottom, firstTop: top });
    order.forEach((k) => renderSection(main, k, light));
  }

  if (!placed && !clean(p.fullName, emb)) throw ApiError.badRequest('Add some content to your resume before exporting');

  const range = doc.bufferedPageRange();
  if (range.count > 1) {
    const x = tpl.layout === 'sidebar-left' ? tpl.sidebar.width + 26 : m;
    const w = tpl.layout === 'sidebar-left' ? W - x - m : W - 2 * m;
    for (let i = 0; i < range.count; i += 1) {
      doc.switchToPage(i);
      doc.font(faces.regular).fontSize(8).fillColor('#9ca3af').text(`Page ${i + 1} of ${range.count}`, x, bottom + FOOTER - 2, { width: w, align: 'center', lineBreak: false });
    }
  }
  return tpl;
}

function renderResume(resume) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4', margin: 0, bufferPages: true,
      info: { Title: clean(resume.name) || 'Resume', Author: clean(resume.personalInfo && resume.personalInfo.fullName) || '', Producer: 'Resume Builder' },
    });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    try { build(doc, resume); doc.end(); } catch (err) { reject(err); }
  });
}

module.exports = { renderResume };
