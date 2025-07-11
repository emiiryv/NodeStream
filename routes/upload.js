const express = require('express');
const multer = require('multer');
const path = require('path');
const { handleUpload } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// 🔐 authMiddleware sayesinde sadece giriş yapanlar yükleyebilir
router.post('/', authMiddleware, upload.single('video'), handleUpload);

module.exports = router;