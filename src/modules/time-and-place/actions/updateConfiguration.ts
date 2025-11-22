'use server'

import { PartnerExtensionsApi } from '@chasterapp/chaster-js'
import { createApiInstance } from '@/modules/network/helpers/createApiInstance'
import type { TimeAndPlaceConfiguration } from '../types/publicTypes'
import { TimeAndPlaceConfigurationSchema } from '../types/publicTypes'

type Params = {
  token: string
  configuration: TimeAndPlaceConfiguration
}

export async function updateConfiguration({ token, configuration }: Params) {
  const parsedConfiguration =
    TimeAndPlaceConfigurationSchema.parse(configuration)

  await createApiInstance(PartnerExtensionsApi).updateConfiguration(token, {
    config: parsedConfiguration,
  })
}
