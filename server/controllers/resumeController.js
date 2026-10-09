const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateResumePdf } = require('../services/pdf');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SORTS = { updated: 'updatedAt', created: 'createdAt', name: 'name', completion: 'completion.percent' };
const LIST_FIELDS = 'name template completion personalInfo.fullName personalInfo.title customization.primaryColor createdAt updatedAt';

const findOwned = async (req) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
  if (!resume) throw ApiError.notFound('Resume not found');
  return resume;
};

exports.list = asyncHandler(async (req, res) => {
  const { q, template, sort, order, page, limit } = req.validatedQuery;
  const filter = { user: req.user.id };
  if (template) filter.template = template;
  if (q) filter.name = { $regex: escapeRegex(q), $options: 'i' };

  const dir = (order || (sort === 'name' ? 'asc' : 'desc')) === 'asc' ? 1 : -1;
  const [resumes, total, totalAll] = await Promise.all([
    Resume.find(filter).select(LIST_FIELDS).sort({ [SORTS[sort]]: dir, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Resume.countDocuments(filter),
    Resume.countDocuments({ user: req.user.id }),
  ]);
  res.json({ success: true, resumes, total, totalAll, page, pages: Math.ceil(total / limit) });
});

exports.stats = asyncHandler(async (req, res) => {
  const user = new mongoose.Types.ObjectId(req.user.id);
  const [agg] = await Resume.aggregate([
    { $match: { user } },
    { $group: { _id: null, total: { $sum: 1 }, avg: { $avg: '$completion.percent' }, last: { $max: '$updatedAt' } } },
  ]);
  const recent = await Resume.find({ user }).select('name template completion updatedAt').sort({ updatedAt: -1 }).limit(3).lean();
  res.json({ success: true, stats: { total: agg?.total || 0, avgCompletion: Math.round(agg?.avg || 0), lastUpdated: agg?.last || null, recent } });
});

exports.downloads = asyncHandler(async (req, res) => {
  const user = new mongoose.Types.ObjectId(req.user.id);
  const downloads = await Resume.aggregate([
    { $match: { user } }, { $unwind: '$downloadHistory' }, { $sort: { 'downloadHistory.at': -1 } }, { $limit: 15 },
    { $project: { name: 1, template: '$downloadHistory.template', at: '$downloadHistory.at' } },
  ]);
  res.json({ success: true, downloads });
});

// Renders an unsaved draft to PDF so the editor preview matches the final export exactly.
exports.preview = asyncHandler(async (req, res) => {
  const { buffer } = await generateResumePdf(new Resume({ ...req.body, user: req.user.id }));
  res.set({ 'Content-Type': 'application/pdf', 'Content-Length': buffer.length, 'Cache-Control': 'no-store' });
  res.send(buffer);
});

exports.create = asyncHandler(async (req, res) => {
  const data = { ...req.body, user: req.user.id };
  if (!data.personalInfo?.fullName) {
    data.personalInfo = { ...data.personalInfo, fullName: req.user.name, email: data.personalInfo?.email || req.user.email };
  }
  const resume = await Resume.create(data);
  res.status(201).json({ success: true, resume });
});

exports.get = asyncHandler(async (req, res) => {
  res.json({ success: true, resume: await findOwned(req) });
});

exports.update = asyncHandler(async (req, res) => {
  const resume = await findOwned(req);
  resume.set(req.body); // arrays are replaced wholesale, which matches editor/reorder semantics
  await resume.save(); // runs validation + completion hook
  res.json({ success: true, resume });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await Resume.deleteOne({ _id: req.params.id, user: req.user.id });
  if (!result.deletedCount) throw ApiError.notFound('Resume not found');
  res.json({ success: true, message: 'Resume deleted' });
});

exports.duplicate = asyncHandler(async (req, res) => {
  const source = (await findOwned(req)).toObject();
  const { _id, createdAt, updatedAt, downloadHistory, ...rest } = source; // eslint-disable-line no-unused-vars
  const copy = await Resume.create({ ...rest, name: `${source.name} (Copy)`.slice(0, 100) });
  res.status(201).json({ success: true, resume: copy });
});

exports.pdf = asyncHandler(async (req, res) => {
  const resume = await findOwned(req);
  const { buffer, filename } = await generateResumePdf(resume);
  const inline = req.query.disposition === 'inline';
  if (!inline) {
    await Resume.updateOne(
      { _id: resume._id },
      { $push: { downloadHistory: { $each: [{ at: new Date(), template: resume.template }], $slice: -20 } } },
      { timestamps: false }
    );
  }
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': buffer.length,
    'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${filename}"`,
    'Cache-Control': 'no-store',
    'Access-Control-Expose-Headers': 'Content-Disposition',
  });
  res.send(buffer);
});
