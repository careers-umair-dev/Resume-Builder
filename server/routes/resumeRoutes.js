const router = require('express').Router();
const c = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators/resume');

router.use(protect);

router.route('/')
  .get(validate(v.listQuerySchema, 'query'), c.list)
  .post(validate(v.createResumeSchema), c.create);
const rateLimit = require('express-rate-limit');

const previewLimiter = rateLimit({ windowMs: 60 * 1000, limit: 240, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many preview requests. Please slow down' } });

router.post('/preview', previewLimiter, validate(v.createResumeSchema), c.preview);
router.get('/stats', c.stats);
router.get('/downloads', c.downloads); // must stay above '/:id'
router.route('/:id')
  .get(c.get)
  .put(validate(v.updateResumeSchema), c.update)
  .delete(c.remove);
router.post('/:id/duplicate', c.duplicate);
router.get('/:id/pdf', c.pdf);

module.exports = router;
