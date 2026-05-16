import { HttpError } from './httpError.js'

const durationMap = {
  '10m': 10 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
}

export function calculateExpiry(expiryType, customDurationValue, customDurationUnit, isOneTimeView = false) {
  // For one-time-view shares, set a much longer expiry (30 days) so the link stays valid for safe access
  if (isOneTimeView) {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }

  if (expiryType === 'custom') {
    const value = Number(customDurationValue)
    if (!Number.isFinite(value) || value <= 0) {
      throw new HttpError(400, 'Custom duration must be greater than 0')
    }

    const unitMap = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    }

    const unit = unitMap[customDurationUnit]
    if (!unit) {
      throw new HttpError(400, 'Invalid custom duration unit')
    }

    return new Date(Date.now() + value * unit)
  }

  const duration = durationMap[expiryType]
  if (!duration) {
    throw new HttpError(400, 'Invalid expiry duration')
  }

  return new Date(Date.now() + duration)
}

export function isExpired(expiresAt) {
  return new Date(expiresAt).getTime() <= Date.now()
}
