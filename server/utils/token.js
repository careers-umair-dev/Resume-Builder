const jwt = require('jsonwebtoken');
const env = require('../config/env');

exports.signToken = (userId) =>
  jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
