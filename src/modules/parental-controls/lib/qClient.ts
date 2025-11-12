import 'server-only'

import type {
  Account,
  DeviceUserStatus,
  EventsResponse,
  License,
  QDevice,
  QProfile,
  QProfileRules,
  QProfileRulesPut,
} from './qApi'
import { buildBrowserLikeHeaders } from '@/modules/parental-controls/lib/buildBrowserLikeHeaders'

const apiBaseUrl = Buffer.from(
  'aHR0cHM6Ly9hcGkucXVzdG9kaW8uY29t',
  'base64',
).toString('utf-8')

export async function getDevices(
  accountId: number,
  accessToken: string,
): Promise<readonly QDevice[]> {
  const response = await fetch(
    `${apiBaseUrl}/v1/accounts/${accountId}/devices`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...buildBrowserLikeHeaders(),
        authorization: `Bearer ${accessToken}`,
      },
    },
  )
  return (await response.json()) as unknown as QDevice[]
}

export async function getDevice(
  accountId: number,
  deviceId: number,
  accessToken: string,
): Promise<QDevice> {
  const response = await fetch(
    `${apiBaseUrl}/v1/accounts/${accountId}/devices/${deviceId}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...buildBrowserLikeHeaders(),
        authorization: `Bearer ${accessToken}`,
      },
    },
  )
  return (await response.json()) as unknown as QDevice
}

export async function postDeviceStatus(
  accountId: number,
  deviceId: number,
  userId: number,
  accessToken: string,
  status: DeviceUserStatus,
): Promise<QDevice> {
  const device = await getDevice(accountId, deviceId, accessToken)
  const updatedDevice = {
    ...device,
    users: device.users.map((u) => (u.id === userId ? { ...u, status } : u)),
  }

  return updateDevice(accessToken, updatedDevice)
}

export async function getLicense(
  accountId: number,
  accessToken: string,
): Promise<License> {
  const response = await fetch(
    `${apiBaseUrl}/v1/accounts/${accountId}/license`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...buildBrowserLikeHeaders(),
        authorization: `Bearer ${accessToken}`,
      },
    },
  )
  return (await response.json()) as unknown as License
}

/**
 * Return a list of profiles for a given account.
 */
export async function getProfiles(
  accountId: number,
  accessToken: string,
): Promise<QProfile[]> {
  const response = await fetch(
    `${apiBaseUrl}/v1/accounts/${accountId}/profiles/`,
    {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
      body: null,
      headers: {
        ...buildBrowserLikeHeaders(),
        authorization: `Bearer ${accessToken}`,
      },
    },
  )
  return (await response.json()) as QProfile[]
}

export async function getProfileRules(
  accountId: number,
  profileId: number,
  accessToken: string,
): Promise<QProfileRules> {
  const response = await fetch(
    `${apiBaseUrl}/v1/accounts/${accountId}/profiles/${profileId}/rules?app_rules=1`,
    {
      credentials: 'include',
      headers: {
        ...buildBrowserLikeHeaders(),
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: null,
      method: 'GET',
      mode: 'cors',
    },
  )

  if (response.status !== 200) {
    throw new Error(`Failed to fetch profiles: ${await response.text()}`)
  }

  return (await response.json()) as QProfileRules
}

/**
 * Updates the account password. Must provide the old password.
 * @return True if the password change worked.
 */
export async function updatePassword(
  accountId: number,
  accessToken: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch(
    `${apiBaseUrl}/v1/accounts/${accountId}/password`,
    {
      credentials: 'include',
      headers: {
        ...buildBrowserLikeHeaders(),
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      method: 'PUT',
      mode: 'cors',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    },
  )

  if (response.status !== 205) {
    throw new Error(`Failed to update password: ${await response.text()}`)
  }
}

export async function updateEmail(
  accountId: number,
  accessToken: string,
  password: string,
  newEmail: string,
): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/v1/accounts/${accountId}/email`, {
    credentials: 'include',
    headers: {
      ...buildBrowserLikeHeaders(),
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      'parent-device-id': 'unknown',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
    method: 'PUT',
    mode: 'cors',

    body: JSON.stringify({ password: password, new_email: newEmail }),
  })

  if (response.status !== 205) {
    throw new Error(`Failed to update email: ${await response.text()}`)
  }
}

export async function getAccount(accessToken: string): Promise<Account> {
  const response = await fetch(`${apiBaseUrl}/v1/accounts/me`, {
    headers: {
      ...buildBrowserLikeHeaders(),
      authorization: `Bearer ${accessToken}`,
    },
    referrer: 'https://family.qustodio.com/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: null,
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
  })
  return (await response.json()) as Account
}

export async function updateDevice(
  accessToken: string,
  device: QDevice,
): Promise<QDevice> {
  const response = await fetch(
    `${apiBaseUrl}/v1/accounts/${device.account_id}/devices/${device.id}`,
    {
      headers: {
        ...buildBrowserLikeHeaders(),
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(device),
      method: 'PUT',
      mode: 'cors',
      credentials: 'include',
    },
  )
  if (response.status !== 200) {
    throw new Error(`Failed to update Rules: ${await response.text()}`)
  }
  return (await response.json()) as QDevice
}

export async function updateAccount(
  accessToken: string,
  account: Account,
): Promise<Account> {
  const response = await fetch(`${apiBaseUrl}/v1/accounts/${account.id}`, {
    headers: {
      ...buildBrowserLikeHeaders(),
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(account),
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
  })
  if (response.status !== 200) {
    throw new Error(`Failed to update Rules: ${await response.text()}`)
  }
  return (await response.json()) as Account
}

export async function getEvents(
  accountUid: string,
  accessToken: string,
  profileUid: string,
  filter: string = 'all',
  limit: number = 15,
): Promise<EventsResponse> {
  const response = await fetch(
    `${apiBaseUrl}/v2/accounts/${accountUid}/profiles/${profileUid}/events?filter=${filter}&limit=${limit}`,
    {
      headers: {
        ...buildBrowserLikeHeaders(),
        referrerPolicy: 'strict-origin-when-cross-origin',
        authorization: `Bearer ${accessToken}`,
      },
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    },
  )
  if (response.status !== 200) {
    throw new Error(`Failed to fetch events: ${await response.text()}`)
  }
  return (await response.json()) as EventsResponse
}

export async function updateRulesForProfile(
  accessToken: string,
  accountId: number,
  rules: QProfileRulesPut,
): Promise<QProfileRules> {
  const response = await fetch(
    `${apiBaseUrl}/v1/accounts/${accountId}/profiles/${rules.profile}/rules?app_rules=1`,
    {
      headers: {
        ...buildBrowserLikeHeaders(),
        authorization: `Bearer ${accessToken}`,
        referrerPolicy: 'strict-origin-when-cross-origin',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rules),
      method: 'PUT',
      mode: 'cors',
      credentials: 'include',
    },
  )
  if (response.status !== 200) {
    throw new Error(`Failed to update Rules: ${await response.text()}`)
  }
  return (await response.json()) as QProfileRules
}
