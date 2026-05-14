const KEY = 'tempvault_recent_vaults'

export function getRecentVaults() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveRecentVault(vault) {
  const recent = getRecentVaults().filter((item) => item.code !== vault.code)
  recent.unshift({
    code: vault.code,
    expiresAt: vault.expiresAt,
    createdAt: vault.createdAt,
    oneTimeView: vault.oneTimeView,
  })
  localStorage.setItem(KEY, JSON.stringify(recent.slice(0, 8)))
}
