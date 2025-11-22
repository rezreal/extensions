'use server'

import type { TimeAndPlacePublicGetSessionAuthResponse } from '@/modules/time-and-place/types/publicTypes'

import { getValidatedSessionAuth } from '../lib/getValidatedSessionAuth'

type Params = {
  token: string
}

export async function getSessionData({
  token,
}: Params): Promise<TimeAndPlacePublicGetSessionAuthResponse> {
  const auth = await getValidatedSessionAuth(token)

  const mapped: TimeAndPlacePublicGetSessionAuthResponse = {
    ...auth,
    session: {
      ...auth.session,
      data: {
        ...auth.session.data,
      },
    },
  }

  return mapped
}
