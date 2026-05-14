import { HttpError } from '../utils/httpError.js'
import { createVault, getVaultByCode, unlockVault, consumeVaultByCode, markVaultViewed, getVaultFileByCodeAndId } from '../services/vaultService.js'

function buildDownloadUrl(code, fileId) {
  return `/api/vault/download/${code}/${fileId}`
}

function mapVaultResponse(record) {
  const code = record.vault.retrieval_code
  const files = (record.files || []).map((file) => ({
    ...file,
    file_url: buildDownloadUrl(code, file.id),
  }))

  return {
    code,
    id: record.vault.id,
    textContent: record.vault.text_content,
    expiresAt: record.vault.expires_at,
    createdAt: record.vault.created_at,
    views: record.vault.views,
    oneTimeView: record.vault.one_time_view,
    locked: Boolean(record.vault.passphrase_hash),
    files,
  }
}

export async function createVaultController(req, res, next) {
  try {
    const { textContent, passphrase, expiryType, customDurationValue, customDurationUnit, oneTimeView } = req.body

    if (!expiryType) {
      throw new HttpError(400, 'Expiry duration is required')
    }

    const result = await createVault({
      textContent,
      passphrase,
      expiryType,
      customDurationValue,
      customDurationUnit,
      oneTimeView: oneTimeView === 'true' || oneTimeView === true,
      files: req.files || [],
    })

    res.status(201).json({
      success: true,
      message: 'Vault created successfully',
      data: mapVaultResponse(result),
    })
  } catch (error) {
    next(error)
  }
}

export async function getVaultController(req, res, next) {
  try {
    const { code } = req.params
    const record = await getVaultByCode(code.toUpperCase())

    if (!record.vault.passphrase_hash) {
      await markVaultViewed(record.vault)
      res.json({
        success: true,
        data: { ...mapVaultResponse(record) },
      })
      return
    }

    res.json({
      success: true,
      data: {
        code: record.vault.retrieval_code,
        locked: true,
        requiresPassphrase: true,
        expiresAt: record.vault.expires_at,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function unlockVaultController(req, res, next) {
  try {
    const { code, passphrase } = req.body
    if (!code || !passphrase) {
      throw new HttpError(400, 'Code and secret phrase are required')
    }

    const record = await unlockVault(code.toUpperCase(), passphrase)
    await markVaultViewed(record.vault)

    res.json({
      success: true,
      message: 'Vault unlocked',
      data: { ...mapVaultResponse(record) },
    })
  } catch (error) {
    next(error)
  }
}


export async function consumeVaultController(req, res, next) {
  try {
    const { code } = req.body
    if (!code) {
      throw new HttpError(400, 'Code is required')
    }

    await consumeVaultByCode(code.toUpperCase())
    res.json({
      success: true,
      message: 'Vault deleted',
    })
  } catch (error) {
    next(error)
  }
}


export async function downloadVaultFileController(req, res, next) {
  try {
    const { code, fileId } = req.params
    const { file, data } = await getVaultFileByCodeAndId(code.toUpperCase(), fileId)

    const buffer = Buffer.from(await data.arrayBuffer())
    const shouldDownload = req.query.download === '1' || req.query.download === 'true'

    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream')
    res.setHeader('Content-Length', buffer.length)
    res.setHeader('Cache-Control', 'no-store')
    if (shouldDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`)
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${file.file_name}"`)
    }
    res.send(buffer)
  } catch (error) {
    next(error)
  }
}
