const path = require('path');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const env = require('../config/env');
const { AppError } = require('../utils/errors');
const { hashPassword, verifyPassword } = require('../utils/security');

const TABLE_NAME = 'shared_files';

const uploadFile = async ({ file, password, expiresAt, maxDownloads }) => {
  const fileId = uuidv4();
  const extension = path.extname(file.originalname) || '';
  const storagePath = `${fileId}${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(env.bucketName)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (uploadError) {
    throw new AppError(`Storage upload failed: ${uploadError.message}`, 500);
  }

  const hashedPassword = await hashPassword(password);

  const metadata = {
    file_id: fileId,
    storage_path: storagePath,
    original_filename: file.originalname,
    mime_type: file.mimetype,
    file_size: file.size,
    hashed_password: hashedPassword,
    expires_at: expiresAt,
    max_downloads: maxDownloads
  };

  const { data, error: insertError } = await supabase
    .from(TABLE_NAME)
    .insert(metadata)
    .select('file_id, created_at, expires_at, max_downloads')
    .single();

  if (insertError) {
    await supabase.storage.from(env.bucketName).remove([storagePath]);
    throw new AppError(`Metadata save failed: ${insertError.message}`, 500);
  }

  return data;
};

const getFileById = async (fileId) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('file_id', fileId)
    .single();

  if (error || !data) {
    throw new AppError('File not found', 404);
  }

  return data;
};

const validateAccessRules = (record) => {
  if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
    throw new AppError('File has expired', 410);
  }

  if (
    record.max_downloads !== null &&
    record.download_count >= record.max_downloads
  ) {
    throw new AppError('Download limit reached', 410);
  }
};

const authorizeAndGetSignedUrl = async ({ fileId, password }) => {
  const record = await getFileById(fileId);
  validateAccessRules(record);

  const validPassword = await verifyPassword(password, record.hashed_password);
  if (!validPassword) {
    throw new AppError('Invalid password', 401);
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from(env.bucketName)
    .createSignedUrl(record.storage_path, env.signedUrlExpiresSeconds);

  if (signedError || !signedData?.signedUrl) {
    throw new AppError('Failed to create signed URL', 500);
  }

  const { error: updateError } = await supabase
    .from(TABLE_NAME)
    .update({ download_count: record.download_count + 1 })
    .eq('file_id', fileId);

  if (updateError) {
    throw new AppError('Failed to track download count', 500);
  }

  return {
    fileId: record.file_id,
    fileName: record.original_filename,
    signedUrl: signedData.signedUrl,
    expiresInSeconds: env.signedUrlExpiresSeconds
  };
};

module.exports = {
  uploadFile,
  authorizeAndGetSignedUrl,
  getFileById
};
