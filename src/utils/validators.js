const env = require('../config/env');
const { AppError } = require('./errors');

const ensurePassword = (value) => {
  if (typeof value !== 'string' || value.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }
};

const ensureFileId = (value) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (typeof value !== 'string' || !uuidRegex.test(value)) {
    throw new AppError('fileId must be a valid UUID', 400);
  }
};

const parseExpiryHours = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0 || numberValue > 24 * 30) {
    throw new AppError('expiryHours must be a number between 0 and 720', 400);
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + numberValue);
  return expiresAt.toISOString();
};

const parseDownloadLimit = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 10000) {
    throw new AppError('maxDownloads must be an integer between 1 and 10000', 400);
  }

  return parsed;
};

const validateFileInput = (file) => {
  if (!file) {
    throw new AppError('File is required', 400);
  }

  const maxBytes = env.maxFileSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new AppError(`File too large. Max size is ${env.maxFileSizeMb} MB`, 400);
  }

  if (env.allowedMimeTypes.length > 0 && !env.allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError('File type is not allowed', 400);
  }
};

module.exports = {
  ensurePassword,
  ensureFileId,
  parseExpiryHours,
  parseDownloadLimit,
  validateFileInput
};
