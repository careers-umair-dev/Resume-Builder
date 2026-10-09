const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY); // set when behind a reverse proxy so rate limits see real IPs
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.clientUrl.split(',').map((origin) => origin.trim().replace(/\/+$/, '')).filter(Boolean), credentials: true }));
app.use(express.json({ limit: '2mb' }));
if (!env.isProd) app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
