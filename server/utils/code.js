import crypto from 'crypto'

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRetrievalCode(length = 5) {
  let code = ''
  for (let i = 0; i < length; i += 1) {
    const index = crypto.randomInt(0, alphabet.length)
    code += alphabet[index]
  }
  return code
}
