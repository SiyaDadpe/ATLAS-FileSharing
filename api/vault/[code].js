import { getVaultByCode, markVaultViewed, mapVaultResponse } from '../_lib/vault.js'
import { allowMethods, handleApiError, sendJson } from '../_lib/http.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    allowMethods(res, ['GET'])
    return
  }

  try {
    const { code } = req.query
    const record = await getVaultByCode(String(code).toUpperCase())

    if (!record.vault.passphrase_hash) {
      await markVaultViewed(record.vault)
      sendJson(res, 200, {
        success: true,
        data: mapVaultResponse(record),
      })
      return
    }

    sendJson(res, 200, {
      success: true,
      data: {
        code: record.vault.retrieval_code,
        locked: true,
        requiresPassphrase: true,
        expiresAt: record.vault.expires_at,
      },
    })
  } catch (error) {
    handleApiError(res, error)
  }
}
