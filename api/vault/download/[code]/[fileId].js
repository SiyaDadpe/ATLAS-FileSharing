import { getVaultByCode } from '../../../_lib/vault.js'
import { allowMethods, handleApiError } from '../../../_lib/http.js'
import { supabase, storageBucket } from '../../../../server/config/supabase.js'

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

    const bucket = supabase.storage.from(storageBucket)
    const publicResult = await bucket.getPublicUrl(file.storage_path)

    const publicUrl = publicResult?.data?.publicUrl || publicResult?.data?.publicURL || publicResult?.publicUrl || publicResult?.publicURL
    if (publicUrl) {
      res.redirect(302, publicUrl)
      return
    }

    const { data, error } = await bucket.createSignedUrl(file.storage_path, 60)
    const signedUrl = data?.signedUrl || data?.signedURL || data?.signed_url || data?.signed_URL || data?.signedUrl

    if (error || !signedUrl) {
      throw error || new Error('Unable to create download link')
    }

    res.redirect(302, signedUrl)
  } catch (error) {
    handleApiError(res, error)
  }
}
