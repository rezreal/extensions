'use server'

import { createApiInstance } from '@/modules/network/helpers/createApiInstance'
import type { PartnerConfigurationForPublic } from '@chasterapp/chaster-js'
import { PartnerExtensionsApi } from '@chasterapp/chaster-js'
import type { ParentalControlsConfiguration } from '@/modules/parental-controls/types/publicTypes'
import { ParentalControlsConfigurationSchema } from '@/modules/parental-controls/types/publicTypes'

type Params = {
  token: string
}

export type ParentalControlPartnerConfigurationForPublic =
  PartnerConfigurationForPublic & {
    config: ParentalControlsConfiguration
  }

export async function getConfiguration({
  token,
}: Params): Promise<ParentalControlPartnerConfigurationForPublic> {
  const raw = (
    await createApiInstance(PartnerExtensionsApi).getConfiguration(token)
  ).data

  return {
    ...raw,
    config: ParentalControlsConfigurationSchema.parse(raw.config),
  }
}
