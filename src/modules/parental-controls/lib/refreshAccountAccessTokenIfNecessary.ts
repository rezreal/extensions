import 'server-only'
import type { ParentalControlsAccount } from '@/modules/parental-controls/types/internalTypes'
import { refreshAccessToken } from '@/modules/parental-controls/lib/qLogin'
import { patchExtensionSession } from '@/modules/extensions/actions/patchExtensionSession'

export async function refreshAllAccountAccessTokensIfNecessary(
  sessionId: string,
  accounts: readonly ParentalControlsAccount[],
): Promise<readonly ParentalControlsAccount[]> {
  const updatedAccounts = await Promise.all(
    accounts.map(async (account) =>
      refreshAccountAccessTokenIfNecessary(account),
    ),
  )

  await patchExtensionSession(sessionId, {
    data: { accounts: updatedAccounts },
  })

  return updatedAccounts
}

export async function refreshAccountAccessTokenIfNecessary(
  account: ParentalControlsAccount,
): Promise<ParentalControlsAccount> {
  if (account.latestAccessTokenExpiresAt > Date.now() + 1000 * 60) {
    return account // don't refresh if it is still valid
  }

  const refreshedTokenResponse = await refreshAccessToken(account.refreshToken)
  return {
    ...account,
    latestAccessTokenExpiresAt:
      Date.now() + refreshedTokenResponse.expires_in * 1000,
    latestAccessToken: refreshedTokenResponse.access_token,
    refreshToken: refreshedTokenResponse.refresh_token,
  }
}
