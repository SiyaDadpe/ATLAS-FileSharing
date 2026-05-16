import { getVaultFileByCodeAndId } from '../../../../_lib/vault.js'
import { allowMethods, handleApiError } from '../../../../_lib/http.js'

function safeFileName(fileName = 'file') {
  return String(fileName).replace(/"/g, "'")
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    allowMethods(res, ['GET'])
    return
  }

  try {
    const { code, fileId } = req.query
    const { file, data } = await getVaultFileByCodeAndId(String(code).toUpperCase(), fileId)

    const buffer = Buffer.from(await data.arrayBuffer())
    const shouldDownload = req.query.download === '1' || req.query.download === 'true'

    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream')
    res.setHeader('Content-Length', buffer.length)
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader(
      'Content-Disposition',
      `${shouldDownload ? 'attachment' : 'inline'}; filename="${safeFileName(file.file_name)}"`,
    )
    res.status(200).send(buffer)
  } catch (error) {
    handleApiError(res, error)
  }
}
