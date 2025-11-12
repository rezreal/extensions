import 'server-only'

import UserAgent from 'user-agents'

const referer = Buffer.from(
  'aHR0cHM6Ly9mYW1pbHkucXVzdG9kaW8uY29tLw==',
  'base64',
).toString('utf-8')
const clientKey = Buffer.from('cXVzdG9kaW8tY2xpZW50', 'base64').toString(
  'utf-8',
)
const client = Buffer.from(
  'UXVzdG9kaW9QQVJXZWIvUEFSLTE4Mi4xNy4wLTctZzJhOTMwYTFmIChwOmJyb3dzZXIp',
  'base64',
).toString('utf-8')

/** Build http headers that look like an unsuspicious regular browser */
export function buildBrowserLikeHeaders() {
  return {
    accept: '*/*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,de;q=0.7',
    'cache-control': 'no-cache',
    'parent-device-id': 'unknown',
    pragma: 'no-cache',
    [clientKey]: client,
    'user-agent': new UserAgent().random().toString(),
    referer: referer,
    referrerPolicy: 'strict-origin-when-cross-origin',
    'sec-ch-ua':
      '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Unknown"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
  }
}
