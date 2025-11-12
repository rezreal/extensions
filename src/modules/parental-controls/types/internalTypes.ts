import type {
  ExtensionSessionForPartner,
  PartnerGetSessionAuthRepDto,
} from '@chasterapp/chaster-js/dist/api'
;('server-only')

import {
  type ParentalControlsConfiguration,
  ParentalControlsDeviceSchema,
  ParentalControlsLicenseSchema,
} from '@/modules/parental-controls/types/publicTypes'
import { z } from 'zod'

export const ParentalControlsAccountSchema = z.object({
  id: z.number(),
  uid: z.string(),
  email: z.string(),
  createdAt: z.string(),
  password: z.string(),
  refreshToken: z.string(),
  latestAccessToken: z.string(),
  latestAccessTokenExpiresAt: z.number(),
  lockdown: z.optional(
    z.object({
      originalEmail: z.string(),
      originalPassword: z.string(),
    }),
  ),
  devices: z.array(ParentalControlsDeviceSchema),
  license: ParentalControlsLicenseSchema,
})

export type ParentalControlsAccount = z.infer<
  typeof ParentalControlsAccountSchema
>

export const ParentalControlsSessionDataSchema = z.object({
  accounts: z.array(ParentalControlsAccountSchema),
})
export type ParentalControlsSessionData = z.infer<
  typeof ParentalControlsSessionDataSchema
>

export type ParentalControlSessionForPartner = ExtensionSessionForPartner & {
  data: ParentalControlsSessionData
  config: ParentalControlsConfiguration
}

export type ParentalControlPartnerGetSessionAuthRepDto =
  PartnerGetSessionAuthRepDto & {
    session: ExtensionSessionForPartner & {
      data: ParentalControlsSessionData
      config: ParentalControlsConfiguration
    }
  }
