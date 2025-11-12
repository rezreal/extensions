'use server'

import type { ParentalControlPublicGetSessionAuthResponse } from '@/modules/parental-controls/types/publicTypes'
import { getValidatedSessionAuth } from '@/modules/parental-controls/lib/getValidatedSessionAuth'
import { PartnerUserRoleEnum } from '@chasterapp/chaster-js/dist/api'

type Params = {
  token: string
}

export async function getSessionData({
  token,
}: Params): Promise<ParentalControlPublicGetSessionAuthResponse> {
  const auth = await getValidatedSessionAuth(token)

  const mapped: ParentalControlPublicGetSessionAuthResponse = {
    ...auth,
    session: {
      ...auth.session,
      data: {
        ...auth.session.data,
        accounts: auth.session.data.accounts.map((a) => ({
          id: a.id,
          email: auth.role === PartnerUserRoleEnum.Wearer ? a.email : undefined,
          frozen: !!a.lockdown,
          createdAt: a.createdAt,
          devices: a.devices,
          license: a.license,
        })),
      },
    },
  }

  return mapped
}
