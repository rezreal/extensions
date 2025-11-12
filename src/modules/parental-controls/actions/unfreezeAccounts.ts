'use server'

import { PartnerUserRoleEnum } from '@chasterapp/chaster-js'
import type {
  ParentalControlsAccount,
  ParentalControlsSessionData,
} from '@/modules/parental-controls/types/internalTypes'
import { patchExtensionSession } from '@/modules/extensions/actions/patchExtensionSession'
import {
  updateEmail,
  updatePassword,
} from '@/modules/parental-controls/lib/qClient'
import { getValidatedSessionAuth } from '@/modules/parental-controls/lib/getValidatedSessionAuth'

export async function unfreezeAccounts(mainToken: string): Promise<void> {
  const auth = await getValidatedSessionAuth(mainToken)
  const session = auth.session
  const data: ParentalControlsSessionData = session.data

  if (
    auth.role !== PartnerUserRoleEnum.Keyholder &&
    !auth.lockForUser.canBeUnlocked
  ) {
    throw new Error(
      'Only the keyholder may unfreeze accounts on a closed lock.',
    )
  }

  for (const account of data.accounts) {
    await unfreezeAccount(auth.session.sessionId, auth.session.data, account)
  }
}

/**
 * TODO: move somewhere else
 */
export async function unfreezeAccount(
  sessionId: string,
  data: ParentalControlsSessionData,
  account: ParentalControlsAccount,
) {
  if (!account.lockdown) {
    // already unlocked
    return
  }

  const currentData: ParentalControlsSessionData = data

  await updateEmail(
    account.id,
    account.latestAccessToken,
    account.password,
    account.email,
  )
  await updatePassword(
    account.id,
    account.latestAccessToken,
    account.password,
    account.lockdown.originalPassword,
  )

  const newData: ParentalControlsSessionData = {
    ...currentData,
    accounts: [
      ...currentData.accounts.map((a) =>
        a.id === account.id ? { ...a, lockdown: undefined } : a,
      ),
    ],
  }
  await patchExtensionSession(sessionId, { data: newData })
}
