import multer from 'multer'

const maxUploadMb = Number(process.env.MAX_UPLOAD_MB) || 100

const storage = multer.memoryStorage()

function fileFilter(req, file, cb) {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'text/javascript',
    'text/css',
    'application/json',
    'application/javascript',
    'application/x-javascript',
    'text/html',
    'application/xml',
    'text/xml',
  ]

  if (allowed.includes(file.mimetype)) {
    cb(null, true)
    return
  }

  cb(new Error(`Unsupported file type: ${file.mimetype}`))
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxUploadMb * 1024 * 1024,
    files: 20,
  },
})
