import { consumeVaultByCode } from '../_lib/vault.js'
import { allowMethods, handleApiError, readJsonBody, sendJson } from '../_lib/http.js'
import { HttpError } from '../../server/utils/httpError.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    allowMethods(res, ['POST'])
    return
  }

  try {
    const { code } = readJsonBody(req)
    if (!code) {
      throw new HttpError(400, 'Code is required')
    }

    await consumeVaultByCode(String(code).toUpperCase())

    sendJson(res, 200, {
      success: true,
      message: 'Vault deleted',
    })
  } catch (error) {
    handleApiError(res, error)
  }
}
