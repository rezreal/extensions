'use server'

import { createApiInstance } from '@/modules/network/helpers/createApiInstance'
import type { PatchExtensionSessionDto } from '@chasterapp/chaster-js'
import { PartnerExtensionsApi } from '@chasterapp/chaster-js'

export async function patchExtensionSession(
  sessionId: string,
  patch: PatchExtensionSessionDto,
) {
  const { data } = await createApiInstance(
    PartnerExtensionsApi,
  ).patchExtensionSession(sessionId, patch)

  return data
}
