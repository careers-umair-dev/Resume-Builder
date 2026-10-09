const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized();

  const payload = jwt.verify(token, env.jwtSecret); // JWT errors handled centrally
  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  if (user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime()) {
    throw ApiError.unauthorized('Password was changed. Please log in again');
  }
  req.user = user;
  next();
});
