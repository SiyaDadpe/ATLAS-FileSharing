import bcrypt from 'bcryptjs'
import { supabase, storageBucket, assertSupabaseConfigured } from '../config/supabase.js'
import { calculateExpiry, isExpired } from '../utils/expiry.js'
import { generateRetrievalCode } from '../utils/code.js'
import { deleteVaultArtifacts } from '../utils/vaultCleanup.js'
import { sanitizeFileName, isValidFile } from '../utils/fileValidation.js'
import { HttpError } from '../utils/httpError.js'

function createStoragePath(vaultCode, file) {
  const stamp = Date.now()
  const safeName = sanitizeFileName(file.originalname)
  return `${vaultCode}/${stamp}-${safeName}`
}

function buildVaultFileUrl(vaultCode, fileId) {
  return `/api/vault/download/${vaultCode}/${fileId}`
}

async function ensureUniqueCode() {
  for (let i = 0; i < 10; i += 1) {
    const code = generateRetrievalCode()
    const { data, error } = await supabase
      .from('vaults')
      .select('id')
      .eq('retrieval_code', code)
      .maybeSingle()

    if (error) {
      throw new HttpError(500, error.message)
    }

    if (!data) return code
  }

  throw new HttpError(500, 'Unable to generate unique retrieval code')
}

export async function createVault({ textContent, passphrase, expiryType, customDurationValue, customDurationUnit, oneTimeView, files }) {
  assertSupabaseConfigured()
  const expiresAt = calculateExpiry(expiryType, customDurationValue, customDurationUnit, oneTimeView)
  const retrievalCode = await ensureUniqueCode()
  const passphraseHash = passphrase ? await bcrypt.hash(passphrase, 10) : null
  const uploadedStoragePaths = []

  if (files?.length) {
    for (const file of files) {
      if (!isValidFile(file)) {
        throw new HttpError(400, `Unsupported file type: ${file.originalname}`)
      }
    }
  }

  const { data: vault, error: vaultError } = await supabase
    .from('vaults')
    .insert({
      retrieval_code: retrievalCode,
      text_content: textContent || null,
      passphrase_hash: passphraseHash,
      expires_at: expiresAt.toISOString(),
      one_time_view: Boolean(oneTimeView),
      consumed_at: null,
      views: 0,
    })
    .select('*')
    .single()

  if (vaultError) {
    throw new HttpError(500, vaultError.message)
  }

  const uploadedFiles = []

  try {
    for (const file of files || []) {
      const storagePath = createStoragePath(retrievalCode, file)
      uploadedStoragePaths.push(storagePath)
      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        })

      if (uploadError) {
        throw new HttpError(500, uploadError.message)
      }

      const fileRow = {
        vault_id: vault.id,
        file_name: file.originalname,
        file_url: '',
        file_size: file.size,
        mime_type: file.mimetype,
        storage_path: storagePath,
      }

      const { data: insertedFile, error: fileRowError } = await supabase
        .from('vault_files')
        .insert(fileRow)
        .select('*')
        .single()
      if (fileRowError) {
        throw new HttpError(500, fileRowError.message)
      }

      const downloadUrl = buildVaultFileUrl(retrievalCode, insertedFile.id)
      const { error: updateFileError } = await supabase
        .from('vault_files')
        .update({ file_url: downloadUrl })
        .eq('id', insertedFile.id)

      if (updateFileError) {
        throw new HttpError(500, updateFileError.message)
      }

      uploadedFiles.push({ ...insertedFile, file_url: downloadUrl })
    }
  } catch (error) {
    await deleteVaultArtifacts(vault.id, uploadedFiles, uploadedStoragePaths)
    throw error
  }

  return {
    vault: {
      ...vault,
      retrieval_code: retrievalCode,
      files: uploadedFiles,
    },
  }
}

async function fetchVaultData(code) {
  assertSupabaseConfigured()
  const { data: vault, error: vaultError } = await supabase
    .from('vaults')
    .select('*')
    .eq('retrieval_code', code)
    .maybeSingle()

  if (vaultError) {
    throw new HttpError(500, vaultError.message)
  }

  if (!vault) {
    return null
  }

  const { data: files, error: filesError } = await supabase
    .from('vault_files')
    .select('*')
    .eq('vault_id', vault.id)
    .order('created_at', { ascending: true })

  if (filesError) {
    throw new HttpError(500, filesError.message)
  }

  return { vault, files: files || [] }
}

export async function getVaultByCode(code) {
  const record = await fetchVaultData(code)
  if (!record) {
    throw new HttpError(404, 'Vault not found')
  }

  if (isExpired(record.vault.expires_at)) {
    await deleteVaultArtifacts(record.vault.id, record.files)
    throw new HttpError(410, 'Vault expired')
  }

  return record
}

export async function unlockVault(code, passphrase) {
  const record = await fetchVaultData(code)
  if (!record) {
    throw new HttpError(404, 'Vault not found')
  }

  if (isExpired(record.vault.expires_at)) {
    await deleteVaultArtifacts(record.vault.id, record.files)
    throw new HttpError(410, 'Vault expired')
  }

  const { vault } = record

  if (!vault.passphrase_hash) {
    return record
  }

  const matches = await bcrypt.compare(passphrase || '', vault.passphrase_hash)
  if (!matches) {
    throw new HttpError(401, 'Incorrect secret phrase')
  }

  return record
}

export async function consumeVaultByCode(code) {
  const record = await fetchVaultData(code)
  if (!record) {
    throw new HttpError(404, 'Vault not found')
  }

  if (!record.vault.one_time_view) {
    throw new HttpError(400, 'This vault is not one-time view')
  }

  await deleteVaultArtifacts(record.vault.id, record.files)
  return { success: true }
}

export async function getVaultFileByCodeAndId(code, fileId) {
  const record = await fetchVaultData(code)
  if (!record) {
    throw new HttpError(404, 'Vault not found')
  }

  if (isExpired(record.vault.expires_at)) {
    await deleteVaultArtifacts(record.vault.id, record.files)
    throw new HttpError(410, 'Vault expired')
  }

  const file = record.files.find((item) => item.id === fileId)
  if (!file) {
    throw new HttpError(404, 'File not found')
  }

  const { data, error } = await supabase.storage.from(storageBucket).download(file.storage_path)
  if (error) {
    throw new HttpError(500, error.message)
  }

  return { vault: record.vault, file, data }
}

export async function markVaultViewed(vault) {
  if (!vault?.id) return
  const { error } = await supabase
    .from('vaults')
    .update({ views: (vault.views || 0) + 1 })
    .eq('id', vault.id)

  if (error) {
    console.error('Unable to update vault views:', error.message)
  }
}

export async function markOneTimeConsumed(vaultId) {
  const { error } = await supabase
    .from('vaults')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', vaultId)
    .is('consumed_at', null)

  if (error) {
    console.error('Unable to mark one-time vault as consumed:', error.message)
  }
}
