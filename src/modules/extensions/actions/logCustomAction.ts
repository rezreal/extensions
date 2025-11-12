'use server'

import { createApiInstance } from '@/modules/network/helpers/createApiInstance'
import type { PartnerCustomLogActionDto } from '@chasterapp/chaster-js'
import { PartnerExtensionsApi } from '@chasterapp/chaster-js'

export async function logCustomAction(
  sessionId: string,
  logAction: PartnerCustomLogActionDto,
) {
  const { data } = await createApiInstance(
    PartnerExtensionsApi,
  ).logCustomAction(sessionId, logAction)

  return data
}
