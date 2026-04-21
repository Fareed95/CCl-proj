# Secure File Sharing with Supabase

A simple and secure file-sharing app using Express + Supabase Storage + Supabase Postgres.

## Features

- Upload files to Supabase Storage
- Password-protected access using bcrypt hashes
- No plaintext passwords stored
- Shareable link format: `/file/{file_id}`
- Optional expiry (hours)
- Optional download limit
- File type and size validation
- Signed URLs for temporary secure download access
- Proper error responses and status codes

## Tech Stack

- Backend: Node.js + Express
- Database + Storage: Supabase
- Password hashing: bcrypt (via bcryptjs)

## Project Structure

```text
.
├── public/
│   ├── app.js
│   ├── file.html
│   ├── index.html
│   └── styles.css
├── src/
│   ├── config/
│   │   ├── env.js
│   │   └── supabase.js
│   ├── controllers/
│   │   └── fileController.js
│   ├── middlewares/
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── fileRoutes.js
│   ├── services/
│   │   └── fileService.js
│   ├── utils/
│   │   ├── errors.js
│   │   ├── security.js
│   │   └── validators.js
│   └── server.js
├── supabase/
│   └── schema.sql
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 1) Supabase Setup

1. Create a Supabase project (you already provided URL):
   - `https://yqzbhhgceopwskktbnsc.supabase.co`
2. In Supabase SQL editor, run `supabase/schema.sql`.
3. In Supabase Storage:
   - Create bucket named `secure-files` (or change env var)
   - Set bucket visibility to **private**
4. From project settings, copy:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

## 2) Environment Variables

Copy `.env.example` to `.env` and fill values:

```env
PORT=3000
SUPABASE_URL=https://yqzbhhgceopwskktbnsc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=secure-files
MAX_FILE_SIZE_MB=10
ALLOWED_MIME_TYPES=image/png,image/jpeg,application/pdf,text/plain
SIGNED_URL_EXPIRES_SECONDS=60
```

## 3) Install & Run

```bash
npm install
npm run dev
```

Open:

- Main UI: `http://localhost:3000/`
- Share link format: `http://localhost:3000/file/{file_id}`

## API Endpoints

### Upload

`POST /api/upload` (multipart/form-data)

Fields:

- `file` (required)
- `password` (required, min 8)
- `expiryHours` (optional)
- `maxDownloads` (optional)

Success `201`:

```json
{
  "message": "File uploaded successfully",
  "fileId": "UUID",
  "shareLink": "/file/UUID",
  "createdAt": "2026-04-21T...",
  "expiresAt": null,
  "maxDownloads": null
}
```

### Access / Unlock file

`POST /api/access`

```json
{
  "fileId": "UUID",
  "password": "user-password"
}
```

Success `200`:

```json
{
  "fileId": "UUID",
  "fileName": "example.pdf",
  "signedUrl": "https://...",
  "expiresInSeconds": 60
}
```

Error examples:

- `401` Invalid password
- `404` File not found
- `410` File expired / download limit reached
- `400` Validation errors

### File metadata (safe view)

`GET /api/files/:fileId`

Returns non-sensitive metadata (no password hash).

## Security Notes

- Passwords are hashed with `bcrypt` (`salt rounds = 12`).
- App never stores plaintext passwords.
- Downloads use short-lived signed URLs.
- Keep `SUPABASE_SERVICE_ROLE_KEY` private and server-side only.

## Optional Improvements

- Rate limiting on `/api/access`
- CAPTCHA for repeated failed attempts
- Malware scanning before upload
- Automatic cleanup job for expired files
