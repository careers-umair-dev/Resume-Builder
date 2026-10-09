const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators/auth');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later' },
});

router.post('/register', limiter, validate(v.registerSchema), c.register);
router.post('/login', limiter, validate(v.loginSchema), c.login);
router.get('/me', protect, c.me);
router.put('/profile', protect, validate(v.profileSchema), c.updateProfile);
router.put('/password', protect, validate(v.passwordSchema), c.changePassword);

module.exports = router;
