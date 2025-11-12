import 'server-only'
import { ParentalControlsConfigurationSchema } from '@/modules/parental-controls/types/publicTypes'

import { CHASTER_API_CLIENT_ID } from '@/constants'
import { createApiInstance } from '@/modules/network/helpers/createApiInstance'
import { PartnerExtensionsApi } from '@chasterapp/chaster-js'
import type {
  ParentalControlPartnerGetSessionAuthRepDto,
  ParentalControlsSessionData,
} from '@/modules/parental-controls/types/internalTypes'
import { ParentalControlsSessionDataSchema } from '@/modules/parental-controls/types/internalTypes'

export async function getValidatedSessionAuth(
  token: string,
): Promise<ParentalControlPartnerGetSessionAuthRepDto> {
  const response = await createApiInstance(PartnerExtensionsApi).getSessionAuth(
    token,
    CHASTER_API_CLIENT_ID,
  )
  const dto = response.data

  const data: ParentalControlsSessionData =
    ParentalControlsSessionDataSchema.parse(dto.session.data)

  const config = ParentalControlsConfigurationSchema.parse(dto.session.config)

  return { ...dto, session: { ...dto.session, config, data } }
}
