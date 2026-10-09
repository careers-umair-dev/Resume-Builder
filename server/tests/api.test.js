// Database-free API tests: models are stubbed where a query would run, so these cover routing,
// auth middleware, validation, error handling, PDF generation and uploads.
process.env.JWT_SECRET = 'test-secret-'.padEnd(40, 'x');
process.env.MONGO_URI = 'mongodb://unused';
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'http://localhost:5173, https://client.example.com';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const request = require('supertest');

const app = require('../app');
const User = require('../models/User');
const Resume = require('../models/Resume');
const { TEMPLATES } = require('../services/pdf/templates');

const USER_ID = '507f1f77bcf86cd799439012';
const RESUME_ID = '507f1f77bcf86cd799439011';
const token = jwt.sign({ sub: USER_ID }, process.env.JWT_SECRET, { expiresIn: '1h' });
const auth = { Authorization: `Bearer ${token}` };
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)]);

const draft = {
  template: 'modern-professional',
  personalInfo: { fullName: 'Test Person', title: 'Developer', email: 'test@example.com' },
  summary: 'A short summary.',
  experience: [{ _id: RESUME_ID, title: 'Intern', company: 'Acme', description: 'Did things.\n- Shipped a feature' }],
  skills: [{ name: 'React', category: 'Frontend', level: 'Advanced' }],
  enabledSections: ['summary', 'experience', 'skills'],
};

const original = {};
let updates = [];
const uploaded = [];
before(() => {
  original.findById = User.findById; original.findOne = Resume.findOne; original.updateOne = Resume.updateOne;
  User.findById = async () => ({ id: USER_ID, _id: USER_ID, name: 'Tester', email: 't@example.com', passwordChangedAt: null });
  Resume.updateOne = async (...args) => { updates.push(args); return { acknowledged: true }; };
});
after(() => {
  User.findById = original.findById; Resume.findOne = original.findOne; Resume.updateOne = original.updateOne;
  uploaded.forEach((f) => fs.rmSync(path.join(__dirname, '../uploads', f), { force: true }));
});

test('health check', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('CORS accepts each configured origin even when the list contains spaces', async () => {
  const res = await request(app).get('/api/health').set('Origin', 'https://client.example.com');
  assert.equal(res.status, 200);
  assert.equal(res.headers['access-control-allow-origin'], 'https://client.example.com');
});

test('unknown route returns JSON 404', async () => {
  const res = await request(app).get('/api/nope');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});

test('register validates input and reports field errors', async () => {
  const res = await request(app).post('/api/auth/register').send({ name: 'A', email: 'bad', password: 'short' });
  assert.equal(res.status, 400);
  const fields = res.body.errors.map((e) => e.field);
  assert.deepEqual([...new Set(fields)].sort(), ['email', 'name', 'password']);
});

test('malformed JSON is a 400, not a 500', async () => {
  const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad');
  assert.equal(res.status, 400);
  assert.equal(res.body.message, 'Malformed JSON body');
});

test('protected routes reject missing, invalid and expired tokens', async () => {
  assert.equal((await request(app).get('/api/resumes')).status, 401);
  const bad = await request(app).get('/api/resumes').set('Authorization', 'Bearer nonsense');
  assert.equal(bad.status, 401); assert.match(bad.body.message, /Invalid/);
  const expired = jwt.sign({ sub: USER_ID }, process.env.JWT_SECRET, { expiresIn: -10 });
  const res = await request(app).get('/api/resumes').set('Authorization', `Bearer ${expired}`);
  assert.equal(res.status, 401); assert.match(res.body.message, /expired/i);
});

test('tokens issued before a password change are rejected', async () => {
  const prev = User.findById;
  User.findById = async () => ({ id: USER_ID, passwordChangedAt: new Date(Date.now() + 60_000) });
  const res = await request(app).get('/api/auth/me').set(auth);
  User.findById = prev;
  assert.equal(res.status, 401);
});

test('preview renders an unsaved draft as a PDF', async () => {
  const res = await request(app).post('/api/resumes/preview').set(auth).send(draft).buffer(true).parse((r, cb) => { const c = []; r.on('data', (d) => c.push(d)); r.on('end', () => cb(null, Buffer.concat(c))); });
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /application\/pdf/);
  assert.equal(res.body.subarray(0, 5).toString(), '%PDF-');
});

test('every template renders', async () => {
  for (const id of Object.keys(TEMPLATES)) {
    const res = await request(app).post('/api/resumes/preview').set(auth).send({ ...draft, template: id });
    assert.equal(res.status, 200, `${id} failed`);
  }
});

test('preview rejects an empty draft and invalid settings with clear errors', async () => {
  const empty = await request(app).post('/api/resumes/preview').set(auth).send({});
  assert.equal(empty.status, 400); assert.match(empty.body.message, /Add some content/);
  const badColor = await request(app).post('/api/resumes/preview').set(auth).send({ ...draft, customization: { primaryColor: 'blue' } });
  assert.equal(badColor.status, 400);
  const badTemplate = await request(app).post('/api/resumes/preview').set(auth).send({ ...draft, template: 'nope' });
  assert.equal(badTemplate.status, 400);
});

test('pdf download: attachment records history, inline does not, missing resume is 404', async () => {
  Resume.findOne = async (q) => (String(q._id) === RESUME_ID && String(q.user) === USER_ID ? new Resume({ ...draft, name: 'My Resume', user: USER_ID }) : null);
  updates = [];
  const dl = await request(app).get(`/api/resumes/${RESUME_ID}/pdf`).set(auth);
  assert.equal(dl.status, 200);
  assert.match(dl.headers['content-disposition'], /^attachment; filename="My_Resume\.pdf"/);
  assert.equal(updates.length, 1);
  const inline = await request(app).get(`/api/resumes/${RESUME_ID}/pdf?disposition=inline`).set(auth);
  assert.match(inline.headers['content-disposition'], /^inline/);
  assert.equal(updates.length, 1);
  const missing = await request(app).get('/api/resumes/507f1f77bcf86cd799439099/pdf').set(auth);
  assert.equal(missing.status, 404);
});

test('photo upload accepts real images and rejects everything else', async () => {
  const ok = await request(app).post('/api/uploads/photo').set(auth).attach('photo', PNG, { filename: 'a.png', contentType: 'image/png' });
  assert.equal(ok.status, 201);
  assert.match(ok.body.url, new RegExp(`^/uploads/${USER_ID}-[0-9a-f]{24}\\.png$`));
  uploaded.push(path.basename(ok.body.url));
  const fake = await request(app).post('/api/uploads/photo').set(auth).attach('photo', Buffer.from('<html>not an image</html>'), { filename: 'evil.png', contentType: 'image/png' });
  assert.equal(fake.status, 400);
  const underLimit = await request(app).post('/api/uploads/photo').set(auth).attach('photo', Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024 - PNG.length)]), { filename: 'limit.png', contentType: 'image/png' });
  assert.equal(underLimit.status, 201);
  uploaded.push(path.basename(underLimit.body.url));
  const big = await request(app).post('/api/uploads/photo').set(auth).attach('photo', Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024 + 1 - PNG.length)]), { filename: 'big.png', contentType: 'image/png' });
  assert.equal(big.status, 413);
  assert.equal(big.body.message, 'Image must be 5 MB or smaller');
  const none = await request(app).post('/api/uploads/photo').set(auth);
  assert.equal(none.status, 400);
  assert.equal((await request(app).post('/api/uploads/photo')).status, 401);
});
