import { createVault, mapVaultResponse } from '../_lib/vault.js'
import { allowMethods, handleApiError, sendJson } from '../_lib/http.js'
import { parseMultipartRequest } from '../_lib/form.js'
import { HttpError } from '../../server/utils/httpError.js'

function first(value) {
  return Array.isArray(value) ? value[0] : value
}

function toBoolean(value) {
  return value === true || value === 'true' || value === '1'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    allowMethods(res, ['POST'])
    return
  }

  try {
    const { fields, files } = await parseMultipartRequest(req)
    const expiryType = first(fields.expiryType)

    if (!expiryType) {
      throw new HttpError(400, 'Expiry duration is required')
    }

    const result = await createVault({
      textContent: first(fields.textContent),
      passphrase: first(fields.passphrase),
      expiryType,
      customDurationValue: first(fields.customDurationValue),
      customDurationUnit: first(fields.customDurationUnit),
      oneTimeView: toBoolean(first(fields.oneTimeView)),
      files,
    })

    sendJson(res, 201, {
      success: true,
      message: 'Vault created successfully',
      data: mapVaultResponse(result),
    })
  } catch (error) {
    handleApiError(res, error)
  }
}
