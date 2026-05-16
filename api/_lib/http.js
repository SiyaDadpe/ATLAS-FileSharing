export function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload)
}

export function handleApiError(res, error) {
  console.error(error)
  const statusCode = error?.statusCode || 500
  sendJson(res, statusCode, {
    success: false,
    message: error?.message || 'Something went wrong',
  })
}

export function allowMethods(res, methods) {
  res.setHeader('Allow', methods.join(', '))
  sendJson(res, 405, {
    success: false,
    message: 'Method not allowed',
  })
}

export function readJsonBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return req.body
}
