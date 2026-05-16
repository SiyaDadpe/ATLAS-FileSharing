import formidable from 'formidable'
import fs from 'fs/promises'

function toArray(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

export async function parseMultipartRequest(req) {
  const form = formidable({
    multiples: true,
    maxFiles: 20,
    maxFileSize: (Number(process.env.MAX_UPLOAD_MB) || 100) * 1024 * 1024,
    keepExtensions: true,
  })

  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (error, parsedFields, parsedFiles) => {
      if (error) {
        reject(error)
        return
      }

      resolve({ fields: parsedFields, files: parsedFiles })
    })
  })

  const uploadedFiles = toArray(files.files)
  const normalizedFiles = await Promise.all(uploadedFiles.map(async (file) => ({
    originalname: file.originalFilename || file.newFilename || 'file',
    mimetype: file.mimetype || 'application/octet-stream',
    size: file.size || 0,
    buffer: await fs.readFile(file.filepath),
  })))

  await Promise.all(uploadedFiles.map((file) => fs.unlink(file.filepath).catch(() => {})))

  return { fields, files: normalizedFiles }
}
