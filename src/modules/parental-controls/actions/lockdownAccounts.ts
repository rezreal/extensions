'use server'

import {
  PartnerCustomLogActionDtoIconEnum,
  PartnerUserRoleEnum,
} from '@chasterapp/chaster-js'
import type {
  ParentalControlPartnerGetSessionAuthRepDto,
  ParentalControlsAccount,
  ParentalControlsSessionData,
} from '@/modules/parental-controls/types/internalTypes'
import { patchExtensionSession } from '@/modules/extensions/actions/patchExtensionSession'
import {
  updateEmail,
  updatePassword,
} from '@/modules/parental-controls/lib/qClient'
import { LockStatusEnum } from '@chasterapp/chaster-js/dist/api'

import { getValidatedSessionAuth } from '@/modules/parental-controls/lib/getValidatedSessionAuth'
import { logCustomAction } from '@/modules/extensions/actions/logCustomAction'
import { mapUserRoleToLogRole } from '@/modules/parental-controls/lib/mapUserToleToLogRole'
import { refreshAllAccountAccessTokensIfNecessary } from '@/modules/parental-controls/lib/refreshAccountAccessTokenIfNecessary'

export async function lockdownAccounts(mainToken: string): Promise<void> {
  const auth = await getValidatedSessionAuth(mainToken)

  await refreshAllAccountAccessTokensIfNecessary(
    auth.session.sessionId,
    auth.session.data.accounts,
  )

  const session = auth.session
  const config = session.config
  const data = session.data as ParentalControlsSessionData

  if (
    auth.role !== PartnerUserRoleEnum.Keyholder ||
    auth.lockForUser.status !== LockStatusEnum.Locked
  ) {
    throw new Error('Only the keyholder may freeze accounts on locked lock.')
  }

  if (!auth.session.config.allowAccountFreezing) {
    throw new Error('Account freezing is not allowed for this lock.')
  }

  for (const account of data.accounts) {
    await freezeAccount(auth, account)
  }

  if (!config.hideChanges) {
    await logCustomAction(auth.session.sessionId, {
      role: mapUserRoleToLogRole(auth.role),
      icon: PartnerCustomLogActionDtoIconEnum.Snowflakes,
      title: '%USER% froze qustodio accounts',
      description: `The following qustodio accounts are now frozen and will be recovered when the lock opens: ${data.accounts
        .map((a) => a.id)
        .join(', ')}`,
    })
  }

  async function freezeAccount(
    auth: ParentalControlPartnerGetSessionAuthRepDto,
    account: ParentalControlsAccount,
  ): Promise<void> {
    if (account.lockdown) {
      // already lockdown
      return
    }
    const currentData: ParentalControlsSessionData = auth.session.data

    const generatedPassword = window.crypto
      .getRandomValues(new BigUint64Array(1))[0]
      .toString(36)
    const generatedEmail =
      window.crypto
        .getRandomValues(new BigUint64Array(1))[0]
        .toString(36)
        .substring(0, 6) + account.email

    const newData: ParentalControlsSessionData = {
      ...currentData,
      accounts: [
        ...currentData.accounts.map((a) =>
          a.id === account.id
            ? {
                ...a,
                email: generatedEmail,
                password: generatedPassword,
                lockdown: {
                  originalEmail: a.email,
                  originalPassword: a.password,
                },
              }
            : a,
        ),
      ],
    }
    await patchExtensionSession(auth.session.sessionId, { data: newData })

    await updateEmail(
      account.id,
      account.latestAccessToken,
      account.password,
      account.lockdown!.originalEmail,
    )
    await updatePassword(
      account.id,
      account.latestAccessToken,
      account.password,
      account.lockdown!.originalPassword,
    )
  }
}
