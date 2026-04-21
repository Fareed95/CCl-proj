const dotenv = require('dotenv');

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
  port: parseNumber(process.env.PORT, 3000),
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  bucketName: process.env.SUPABASE_STORAGE_BUCKET || 'secure-files',
  maxFileSizeMb: parseNumber(process.env.MAX_FILE_SIZE_MB, 10),
  allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  signedUrlExpiresSeconds: parseNumber(process.env.SIGNED_URL_EXPIRES_SECONDS, 60)
};

const missing = ['supabaseUrl', 'supabaseServiceRoleKey']
  .filter((key) => !env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = env;
