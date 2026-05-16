import { getVaultByCode } from '../../../../_lib/vault.js'
import { allowMethods, handleApiError } from '../../../../_lib/http.js'
import { supabase, storageBucket } from '../../../../../server/config/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    allowMethods(res, ['GET'])
    return
  }

  try {
    const { code, fileId } = req.query
    const record = await getVaultByCode(String(code).toUpperCase())
    const file = (record.files || []).find((item) => item.id === fileId)

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found' })
      return
    }

    const { data, error } = await supabase.storage
      .from(storageBucket)
      .createSignedUrl(file.storage_path, 60)

    if (error || !data?.signedUrl) {
      throw error || new Error('Unable to create download link')
    }

    res.redirect(302, data.signedUrl)
  } catch (error) {
    handleApiError(res, error)
  }
}
