import { supabase, storageBucket, assertSupabaseConfigured } from '../config/supabase.js'

export async function deleteVaultArtifacts(vaultId, fileRows = [], storagePaths = []) {
  assertSupabaseConfigured()
  const pathsFromRows = fileRows.map((row) => row.storage_path).filter(Boolean)
  const allStoragePaths = [...new Set([...pathsFromRows, ...storagePaths].filter(Boolean))]

  if (allStoragePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from(storageBucket).remove(allStoragePaths)
    if (storageError) {
      console.error('Storage cleanup failed:', storageError.message)
    }
  }

  const { error: filesError } = await supabase.from('vault_files').delete().eq('vault_id', vaultId)
  if (filesError) {
    console.error('File row cleanup failed:', filesError.message)
  }

  const { error: vaultError } = await supabase.from('vaults').delete().eq('id', vaultId)
  if (vaultError) {
    console.error('Vault cleanup failed:', vaultError.message)
  }
}
