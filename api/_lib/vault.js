import {
  createVault as createVaultService,
  getVaultByCode,
  unlockVault,
  consumeVaultByCode,
  markVaultViewed,
  getVaultFileByCodeAndId,
} from '../../server/services/vaultService.js'

export {
  createVaultService as createVault,
  getVaultByCode,
  unlockVault,
  consumeVaultByCode,
  markVaultViewed,
  getVaultFileByCodeAndId,
}

export function buildDownloadUrl(code, fileId) {
  return `/api/vault/download/${code}/${fileId}`
}

export function mapVaultResponse(record) {
  const code = record.vault.retrieval_code
  const files = (record.files || []).map((file) => ({
    ...file,
    file_url: file.file_url || buildDownloadUrl(code, file.id),
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
