import { WEBHOOK_PASSWORD, WEBHOOK_USERNAME } from '@/constants'

export function isBasicAuthed(req: Request): boolean {
  const authHeader = req.headers.get('Authorization')

  if (!authHeader) {
    return false
  }
  const auth = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':')
  const user = auth[0]
  const pass = auth[1]

  if (user == WEBHOOK_USERNAME && pass == WEBHOOK_PASSWORD) {
    return true
  } else {
    return false
  }
}
