import { unlockVault, markVaultViewed, mapVaultResponse } from '../_lib/vault.js'
import { allowMethods, handleApiError, readJsonBody, sendJson } from '../_lib/http.js'
import { HttpError } from '../../server/utils/httpError.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    allowMethods(res, ['POST'])
    return
  }

  try {
    const { code, passphrase } = readJsonBody(req)
    if (!code || !passphrase) {
      throw new HttpError(400, 'Code and secret phrase are required')
    }

    const record = await unlockVault(String(code).toUpperCase(), passphrase)
    await markVaultViewed(record.vault)

    sendJson(res, 200, {
      success: true,
      message: 'Vault unlocked',
      data: await mapVaultResponse(record),
    })
  } catch (error) {
    handleApiError(res, error)
  }
}
