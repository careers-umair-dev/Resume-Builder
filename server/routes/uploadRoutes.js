const router = require('express').Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { uploadPhoto } = require('../controllers/uploadController');
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_PHOTO_SIZE + 1, files: 1 } });

router.post('/photo', protect, upload.single('photo'), uploadPhoto);

module.exports = router;
