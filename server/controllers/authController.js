const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');

const send = (res, status, user) =>
  res.status(status).json({ success: true, token: signToken(user.id), user });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) throw ApiError.conflict('An account with this email already exists');
  const user = await User.create({ name, email, password });
  send(res, 201, user);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  // same message for unknown email and wrong password (no account enumeration)
  if (!user || !(await user.comparePassword(password))) throw ApiError.unauthorized('Invalid email or password');
  send(res, 200, user);
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  if (req.body.email && req.body.email !== req.user.email && (await User.exists({ email: req.body.email }))) {
    throw ApiError.conflict('An account with this email already exists');
  }
  req.user.set(req.body);
  await req.user.save();
  res.json({ success: true, user: req.user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  if (req.body.currentPassword === req.body.newPassword) {
    throw ApiError.badRequest('New password must be different from the current one');
  }
  user.password = req.body.newPassword;
  await user.save();
  send(res, 200, user); // fresh token; older tokens are rejected via passwordChangedAt
});
