import 'server-only'

import { CHASTER_API_CLIENT_ID } from '@/constants'
import { createApiInstance } from '@/modules/network/helpers/createApiInstance'
import type { GetPartnerSessionRepDto } from '@chasterapp/chaster-js'
import { PartnerExtensionsApi } from '@chasterapp/chaster-js'
import type { ParentalControlsSessionData } from '../types/internalTypes'
import { ParentalControlsSessionDataSchema } from '../types/internalTypes'
import type { ParentalControlsConfiguration } from '../types/publicTypes'
import { ParentalControlsConfigurationSchema } from '../types/publicTypes'

export async function getSession(sessionId: string): Promise<{
  raw: GetPartnerSessionRepDto
  config: ParentalControlsConfiguration
  data: ParentalControlsSessionData
}> {
  const response = await createApiInstance(
    PartnerExtensionsApi,
  ).getExtensionSession(sessionId, CHASTER_API_CLIENT_ID)

  const data: ParentalControlsSessionData =
    ParentalControlsSessionDataSchema.parse(response.data.session.data)

  const config = ParentalControlsConfigurationSchema.parse(
    response.data.session.config,
  )

  return {
    raw: response.data,
    data,
    config,
  }
}
