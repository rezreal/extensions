import 'server-only'

import { CHASTER_API_CLIENT_ID } from '@/constants'
import { createApiInstance } from '@/modules/network/helpers/createApiInstance'
import { PartnerExtensionsApi } from '@chasterapp/chaster-js'

import type { TimeAndPlacePublicGetSessionAuthResponse } from '../types/publicTypes'
import {
  TimeAndPlaceConfigurationSchema,
  TimeAndPlacePublicGetSessionAuthResponseSchema,
  TimeAndPlaceSessionDataScheme,
} from '../types/publicTypes'

export async function getValidatedSessionAuth(
  token: string,
): Promise<TimeAndPlacePublicGetSessionAuthResponse> {
  const response = await createApiInstance(PartnerExtensionsApi).getSessionAuth(
    token,
    CHASTER_API_CLIENT_ID,
  )
  const dto = response.data

  const data = dto.session.data
    ? TimeAndPlaceSessionDataScheme.parse(dto.session.data)
    : { ...TimeAndPlaceSessionDataScheme }

  const config = TimeAndPlaceConfigurationSchema.parse(dto.session.config)
  return TimeAndPlacePublicGetSessionAuthResponseSchema.parse({
    ...dto,
    session: { ...dto.session, config, data },
  })
}
