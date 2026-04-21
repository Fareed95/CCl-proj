const { uploadFile, authorizeAndGetSignedUrl, getFileById } = require('../services/fileService');
const {
  ensurePassword,
  ensureFileId,
  parseExpiryHours,
  parseDownloadLimit,
  validateFileInput
} = require('../utils/validators');

const uploadFileHandler = async (req, res, next) => {
  try {
    validateFileInput(req.file);
    ensurePassword(req.body.password);

    const expiresAt = parseExpiryHours(req.body.expiryHours);
    const maxDownloads = parseDownloadLimit(req.body.maxDownloads);

    const result = await uploadFile({
      file: req.file,
      password: req.body.password,
      expiresAt,
      maxDownloads
    });

    return res.status(201).json({
      message: 'File uploaded successfully',
      fileId: result.file_id,
      shareLink: `/file/${result.file_id}`,
      createdAt: result.created_at,
      expiresAt: result.expires_at,
      maxDownloads: result.max_downloads
    });
  } catch (error) {
    return next(error);
  }
};

const accessFileHandler = async (req, res, next) => {
  try {
    const { fileId, password } = req.body;
    ensureFileId(fileId);
    ensurePassword(password);

    const result = await authorizeAndGetSignedUrl({ fileId, password });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const fileInfoHandler = async (req, res, next) => {
  try {
    const record = await getFileById(req.params.fileId);
    return res.status(200).json({
      fileId: record.file_id,
      fileName: record.original_filename,
      mimeType: record.mime_type,
      fileSize: record.file_size,
      createdAt: record.created_at,
      expiresAt: record.expires_at,
      downloadCount: record.download_count,
      maxDownloads: record.max_downloads
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadFileHandler,
  accessFileHandler,
  fileInfoHandler
};
