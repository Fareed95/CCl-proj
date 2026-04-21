const express = require('express');
const multer = require('multer');
const { uploadFileHandler, accessFileHandler, fileInfoHandler } = require('../controllers/fileController');
const env = require('../config/env');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  }
});

router.post('/upload', upload.single('file'), uploadFileHandler);
router.post('/access', express.json(), accessFileHandler);
router.get('/files/:fileId', fileInfoHandler);

module.exports = router;
