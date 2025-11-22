'use server'

import { createApiInstance } from '@/modules/network/helpers/createApiInstance'
import type { PartnerConfigurationForPublic } from '@chasterapp/chaster-js'
import { PartnerExtensionsApi } from '@chasterapp/chaster-js'
import type { TimeAndPlaceConfiguration } from '../types/publicTypes'
import {
  TimeAndPlaceConfigurationDefault,
  TimeAndPlaceConfigurationSchema,
} from '../types/publicTypes'

type Params = {
  token: string
}

export type TimeAndSpacePartnerConfigurationForPublic =
  PartnerConfigurationForPublic & {
    config: TimeAndPlaceConfiguration
  }

export async function getConfiguration({
  token,
}: Params): Promise<TimeAndSpacePartnerConfigurationForPublic> {
  const raw = (
    await createApiInstance(PartnerExtensionsApi).getConfiguration(token)
  ).data

  return {
    ...raw,
    config: raw.config
      ? TimeAndPlaceConfigurationSchema.parse(raw.config)
      : TimeAndPlaceConfigurationDefault,
  }
}
