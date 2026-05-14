import axios from 'axios'

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
export const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, '')

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function toBackendUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${apiOrigin}${path}`
}

export function createVault(payload, onUploadProgress) {
  const formData = new FormData()

  if (payload.textContent) formData.append('textContent', payload.textContent)
  if (payload.passphrase) formData.append('passphrase', payload.passphrase)
  formData.append('expiryType', payload.expiryType)
  if (payload.customDurationValue) formData.append('customDurationValue', payload.customDurationValue)
  if (payload.customDurationUnit) formData.append('customDurationUnit', payload.customDurationUnit)
  if (payload.oneTimeView) formData.append('oneTimeView', String(payload.oneTimeView))

  payload.files.forEach((file) => formData.append('files', file))

  return api.post('/vault/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
}

export function fetchVault(code) {
  return api.get(`/vault/${code}`)
}

export function unlockVault(code, passphrase) {
  return api.post('/vault/unlock', { code, passphrase })
}

export default api

export function consumeVault(code) {
  return api.post('/vault/consume', { code })
}
