import {
  createVault as createVaultService,
  getVaultByCode,
  unlockVault,
  consumeVaultByCode,
  markVaultViewed,
  getVaultFileByCodeAndId,
} from '../../server/services/vaultService.js'
import { supabase, storageBucket } from '../../server/config/supabase.js'

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

async function getAccessibleFileUrl(file) {
  if (!file?.storage_path) return file?.file_url || ''

  const bucket = supabase?.storage?.from(storageBucket)
  if (!bucket) return file.file_url || ''

  const publicResult = bucket.getPublicUrl(file.storage_path)
  if (publicResult?.data?.publicUrl) {
    return publicResult.data.publicUrl
  }

  const { data } = await bucket.createSignedUrl(file.storage_path, 60 * 60)
  return data?.signedUrl || file.file_url || ''
}

export async function mapVaultResponse(record) {
  const code = record.vault.retrieval_code
  const files = await Promise.all((record.files || []).map(async (file) => ({
    ...file,
    file_url: await getAccessibleFileUrl(file) || buildDownloadUrl(code, file.id),
  })))

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
