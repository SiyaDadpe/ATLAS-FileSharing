export function formatBytes(bytes = 0) {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1)
  const value = bytes / 1024 ** index
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${sizes[index]}`
}

export function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function buildVaultUrl(code) {
  return `${window.location.origin}/s/${code}`
}

export function extractCode(value) {
  if (!value) return ''
  const trimmed = value.trim()
  const urlMatch = trimmed.match(/\/(?:s|vault)\/([A-Z0-9]{5})(?:\/?|$)/i)
  if (urlMatch) return urlMatch[1].toUpperCase()

  const codeMatch = trimmed.match(/([A-Z0-9]{5})(?:\/?|$)/i)
  return (codeMatch ? codeMatch[1] : trimmed).toUpperCase()
}
