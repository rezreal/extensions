'use server'

import { PartnerExtensionsApi } from '@chasterapp/chaster-js'
import type { ParentalControlsConfiguration } from '@/modules/parental-controls/types/publicTypes'
import { ParentalControlsConfigurationSchema } from '@/modules/parental-controls/types/publicTypes'
import { createApiInstance } from '@/modules/network/helpers/createApiInstance'

type Params = {
  token: string
  configuration: ParentalControlsConfiguration
}

export async function updateConfiguration({ token, configuration }: Params) {
  const parsedConfiguration =
    ParentalControlsConfigurationSchema.parse(configuration)

  await createApiInstance(PartnerExtensionsApi).updateConfiguration(token, {
    config: parsedConfiguration,
  })
}
