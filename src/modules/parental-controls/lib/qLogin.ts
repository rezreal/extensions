import 'server-only'

import { buildBrowserLikeHeaders } from '@/modules/parental-controls/lib/buildBrowserLikeHeaders'
import { z } from 'zod'

const loginUrl = Buffer.from(
  'aHR0cHM6Ly9hdXRoLnF1c3RvZGlvLmNvbS9lbi9zc28vZG9fbG9naW4v',
  'base64',
).toString('utf-8')
const ssoLoginUrl = Buffer.from(
  'aHR0cHM6Ly9hdXRoLnF1c3RvZGlvLmNvbS9lbi9zc28vbG9naW4v',
  'base64',
).toString('utf-8')
const accessTokenUrl = Buffer.from(
  'aHR0cHM6Ly9hcGkucXVzdG9kaW8uY29tL3YxL29hdXRoMi9hY2Nlc3NfdG9rZW4=',
  'base64',
).toString('utf-8')

const details = Buffer.from(
  '{"source_platform":"Web","source_details":"PAR-182.26.0-50-g8c8b1b7d","source_os_version":"131.0.0.0","source_touchpoint":"Parent Device"}',
).toString('base64url')
const conf = Buffer.from('{"showBackButton":false}').toString('base64url')

function state() {
  const now = new Date().toUTCString()
  const inFive = new Date(Date.now() + 1000 * 60 * 5).toUTCString()
  return Buffer.from(
    `{"5d6f2dfccebda07c0c8444129d7ece4074b685d9d032ed3b97e2d711":{"createdAt":"${now}","expiresOn":"${inFive}"},"location":{"pathname":"/","key":null,"query":{}}}`,
  ).toString('base64url')
}
const clientId = Buffer.from(
  'Mnp1SnNsTnZNeGtmTGdMaWtvUzdQc0FxSUxXTzJsUlNyT0xBaGptZA==',
  'base64',
).toString('utf-8')
const clientSecret = Buffer.from(
  'ZGxRZHpIWUN1ZGNZcUxlT2RWcEk1QlNMZklpZ2J0Q25VZnhWalk1Rlg2Um1QVEwyMlpYUk9DakxqSnhRSDIzWGRBSjdwOHlqdjRhRWU4UktyRkdFZzFrWldwSXBTVlJIUVVCSkhCd3dINzBtSVZTaEpKdmVibTNpT2RqbE1OWlg=',
  'base64',
).toString('utf-8')
const redirectUri = encodeURIComponent(
  Buffer.from(
    'aHR0cHM6Ly9mYW1pbHkucXVzdG9kaW8uY29tL3BhcmVudHMtYXBw',
    'base64',
  ).toString('utf-8'),
)
const referer = Buffer.from(
  'aHR0cHM6Ly9mYW1pbHkucXVzdG9kaW8uY29tLw==',
  'base64',
).toString('utf-8')

export interface TokenResponse {
  /** seconds */
  expires_in: number
  scope: string
  token_type: 'Bearer'
  access_token: string
  refresh_token: string
}

export async function login(
  mail: string,
  password: string,
): Promise<TokenResponse> {
  const aState = state()
  const init = await fetch(
    `${ssoLoginUrl}?response_type=code&state=${aState}&client_id=${clientId}&redirect_uri=${redirectUri}&details=${details}&conf=${conf}`,
    {
      headers: {
        ...buildBrowserLikeHeaders(),
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'upgrade-insecure-requests': '1',
        Referer: referer,
      },
      body: null,
      method: 'GET',
    },
  )

  const sessionCookie = init.headers
    .get('set-cookie')
    ?.split(';')[0]
    .replace('ps_session=', '')

  const doLogin = await fetch(loginUrl, {
    headers: {
      ...buildBrowserLikeHeaders(),
      accept: 'application/json, text/javascript, */*; q=0.01',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
      cookie: `ps_session=${sessionCookie}`,
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: `email=${encodeURIComponent(mail)}&password=${encodeURIComponent(password)}&clientId=${clientId}&state=${aState}&redirectUri=${redirectUri}&details=${details}&conf=${conf}&allowAffiliates=true`,
    method: 'POST',
  })

  const DoLoginResponeSchema = z.object({
    access_url: z.string().nonempty(),
  })

  const doLoginBody = DoLoginResponeSchema.parse(await doLogin.json())

  const accessUrl: string = `${doLoginBody.access_url}`
  const authCode = new URL(accessUrl).searchParams.get('authorization_code')

  const tokenResponse = await fetch(accessTokenUrl, {
    headers: {
      ...buildBrowserLikeHeaders(),
      'content-type': 'application/x-www-form-urlencoded',
      'parent-device-action': 'update-last-seen',
      'parent-device-id': 'unknown',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: `client_id=${clientId}&client_secret=${clientSecret}&code=${authCode}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
    method: 'POST',
  })
  return (await tokenResponse.json()) as TokenResponse
}

/**
 * @param {string} refreshToken A Valid refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenResponse> {
  const response = await fetch(accessTokenUrl, {
    method: 'POST',
    headers: {
      ...buildBrowserLikeHeaders(),
      origin: referer,
      'parent-device-action': 'update-last-seen',
      'parent-device-id': 'unknown',
      referer: referer,
      'content-type': 'application/x-www-form-urlencoded',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
    body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token&refresh_token=${refreshToken}`,
  })

  if (response.status !== 200) {
    throw new Error(`Could not renewToken: ${await response.text()}`)
  }
  return (await response.json()) as TokenResponse
}
