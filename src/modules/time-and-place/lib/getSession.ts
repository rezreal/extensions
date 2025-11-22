import 'server-only'

import { CHASTER_API_CLIENT_ID } from '@/constants'
import { createApiInstance } from '@/modules/network/helpers/createApiInstance'
import type { GetPartnerSessionRepDto } from '@chasterapp/chaster-js'
import { PartnerExtensionsApi } from '@chasterapp/chaster-js'
import type { TimeAndPlaceSessionData } from '../types/publicTypes'
import { TimeAndPlaceSessionDataScheme } from '../types/publicTypes'
import type { TimeAndPlaceConfiguration } from '../types/publicTypes'
import { TimeAndPlaceConfigurationSchema } from '../types/publicTypes'

export async function getSession(sessionId: string): Promise<{
  raw: GetPartnerSessionRepDto
  config: TimeAndPlaceConfiguration
  data: TimeAndPlaceSessionData
}> {
  const response = await createApiInstance(
    PartnerExtensionsApi,
  ).getExtensionSession(sessionId, CHASTER_API_CLIENT_ID)

  const data: TimeAndPlaceSessionData = TimeAndPlaceSessionDataScheme.parse(
    response.data.session.data,
  )

  const config: TimeAndPlaceConfiguration =
    TimeAndPlaceConfigurationSchema.parse(response.data.session.config)

  return {
    raw: response.data,
    data,
    config,
  }
}
