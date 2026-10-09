const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const UPLOAD_DIR = path.join(__dirname, '../uploads');
const isPng = (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const isJpeg = (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

exports.uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Choose an image to upload');
  const { buffer } = req.file;
  // trust file contents, not the client-supplied mimetype or extension
  const ext = isPng(buffer) ? 'png' : isJpeg(buffer) ? 'jpg' : null;
  if (!ext) throw ApiError.badRequest('Only JPG and PNG images are supported');
  const name = `${req.user.id}-${crypto.randomBytes(12).toString('hex')}.${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);
  res.status(201).json({ success: true, url: `/uploads/${name}` });
});
