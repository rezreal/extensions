'use server'

import {
  ActionLogRoleEnum,
  PartnerCustomLogActionDtoIconEnum,
  PartnerUserRoleEnum,
} from '@chasterapp/chaster-js'
import {
  ParentalControlsSessionDataSchema,
  type ParentalControlsAccount,
  type ParentalControlsSessionData,
} from '../types/internalTypes'
import type { NumericBoolean } from '../lib/qApi'
import { Platform } from '../lib/qApi'
import { getAccount, getDevices, getLicense } from '../lib/qClient'
import type { TokenResponse } from '@/modules/parental-controls/lib/qLogin'
import { login } from '@/modules/parental-controls/lib/qLogin'
import dayjs from 'dayjs'
import { patchExtensionSession } from '@/modules/extensions/actions/patchExtensionSession'
import { logCustomAction } from '@/modules/extensions/actions/logCustomAction'
import { getValidatedSessionAuth } from '@/modules/parental-controls/lib/getValidatedSessionAuth'
import type {
  ParentalControlAccountAdd,
  ParentalControlsConfiguration,
  ParentalControlsDevice,
} from '@/modules/parental-controls/types/publicTypes'
import { ParentalControlExtensionPlatform } from '@/modules/parental-controls/types/publicTypes'
import { ParentalControlsAccountAddSchema } from '@/modules/parental-controls/types/publicTypes'

function translatePlatform(
  platform: Platform,
): ParentalControlExtensionPlatform {
  switch (platform) {
    case Platform.Android:
      return ParentalControlExtensionPlatform.ANDROID
    case Platform.Mac:
      return ParentalControlExtensionPlatform.MAC
    case Platform.IOS:
      return ParentalControlExtensionPlatform.IOS
    case Platform.Windows:
      return ParentalControlExtensionPlatform.WINDOWS
  }
}

function translateNumericBoolean(numericBoolean: NumericBoolean) {
  switch (numericBoolean) {
    case 0:
      return false
    case 1:
      return true
  }
}

export async function addAccount(
  mainToken: string,
  add: ParentalControlAccountAdd,
): Promise<void> {
  const auth = await getValidatedSessionAuth(mainToken)
  const session = auth.session
  const config: ParentalControlsConfiguration = auth.session.config
  const currentData: ParentalControlsSessionData = session.data

  if (auth.role !== PartnerUserRoleEnum.Wearer) {
    throw new Error('Only Wearer can add accounts.')
  }

  ParentalControlsAccountAddSchema.parse(add)

  if (currentData.accounts.find((account) => account.email === add.email)) {
    throw new Error('Account with given email already added.')
  }

  let tokenResponse: TokenResponse
  try {
    tokenResponse = await login(add.email, add.password)
  } catch (e) {
    throw new Error('Failed to log in with given credentials')
  }

  const acc = await getAccount(tokenResponse.access_token)
  const license = await getLicense(acc.id, tokenResponse.access_token)
  const devices = await getDevices(acc.id, tokenResponse.access_token)
  const newDevices: ParentalControlsDevice[] = devices.map((d) => ({
    id: d.id,
    name: d.name,
    platform: translatePlatform(d.platform),
    lastSeen: new Date(Date.parse(d.lastseen)).toISOString(),
    enabled: translateNumericBoolean(d.enabled),
  }))

  const newAccount: ParentalControlsAccount = {
    id: acc.id,
    uid: acc.uid,
    email: acc.email,
    createdAt: dayjs().toISOString(),
    password: add.password,
    refreshToken: tokenResponse.refresh_token,
    latestAccessToken: tokenResponse.access_token,
    latestAccessTokenExpiresAt: Date.now() + tokenResponse.expires_in * 1000,
    devices: newDevices,
    license: {
      maxProfiles: license.max_profiles,
      maxDevices: license.max_devices,
      type: license.type,
    },
  }

  const newData: ParentalControlsSessionData = {
    ...currentData,
    accounts: [...currentData.accounts, newAccount],
  }

  await patchExtensionSession(auth.session.sessionId, {
    data: ParentalControlsSessionDataSchema.parse(newData),
  })

  if (!config.hideChanges) {
    await logCustomAction(auth.session.sessionId, {
      role: ActionLogRoleEnum.User,
      icon: PartnerCustomLogActionDtoIconEnum.UserLock,
      title: `%USER% added an qustodio account with ${devices.length} active devices.`,
      description: '',
    })
  }
}
