import { z } from 'zod'
import type { QProfileRules } from '@/modules/parental-controls/lib/qApi'
import { BlockActionCode } from '@/modules/parental-controls/lib/qApi'
import { WebCategory } from '@/modules/parental-controls/lib/qApi'
import {
  LockStatusEnum,
  PartnerUserRoleEnum,
} from '@chasterapp/chaster-js/dist/api'

export const ParentalControlsLicenseSchema = z.object({
  maxProfiles: z.number().positive(),
  maxDevices: z.number().positive(),
  type: z.string(),
})

export const ParentalControlLockCapabilitiesSchema = z.enum([
  'FILTER_CONTENT',
  'BLOCK_APPS',
  'TRACK_ACTIVITY',
  'TRACK_LOCATION',
  'LOCK_DEVICES',
])

export type ParentalControlLockCapabilities = z.infer<
  typeof ParentalControlLockCapabilitiesSchema
>

export enum ParentalControlExtensionPlatform {
  WINDOWS = 'Windows',
  MAC = 'Mac',
  ANDROID = 'Android',
  IOS = 'IOS',
}

export const ParentalControlExtensionPlatformSchema = z.nativeEnum(
  ParentalControlExtensionPlatform,
)

export const ParentalControlsAccountAddSchema = z.object({
  email: z.coerce.string().email().nonempty(),
  password: z.string().nonempty(),
})
export type ParentalControlAccountAdd = z.infer<
  typeof ParentalControlsAccountAddSchema
>

export const ParentalControlsDeviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  platform: ParentalControlExtensionPlatformSchema,
  lastSeen: z.string(),
  enabled: z.optional(z.boolean()),
})

export type ParentalControlsDevice = z.infer<
  typeof ParentalControlsDeviceSchema
>

export const ParentalControlsPublicAccountSchema = z.object({
  id: z.number(),
  /** optional: only visible for wearer */
  email: z.optional(z.string()),
  createdAt: z.string(),
  devices: z.array(ParentalControlsDeviceSchema),
  frozen: z.boolean(),
  license: ParentalControlsLicenseSchema,
})

export type ParentalControlsPublicAccount = z.infer<
  typeof ParentalControlsPublicAccountSchema
>

export const ParentalControlsPublicSessionDataSchema = z.object({
  accounts: z.array(ParentalControlsPublicAccountSchema),
})
export type ParentalControlsPublicSessionData = z.infer<
  typeof ParentalControlsPublicSessionDataSchema
>

export const ParentalControlsConfigurationSchema = z.object({
  capabilities: z.array(ParentalControlLockCapabilitiesSchema),
  allowAccountFreezing: z.boolean(),
  hideChanges: z.boolean(),
})

export type ParentalControlsConfiguration = z.infer<
  typeof ParentalControlsConfigurationSchema
>

export type QustodioExtensionProfileRulesView = Pick<
  QProfileRules,
  'time_restrictions' | 'app_rules' | 'web'
>

export const ParentalControlPublicGetSessionAuthResponseSchema = z.object({
  role: z.nativeEnum(PartnerUserRoleEnum),
  session: z.object({
    slug: z.string(),

    data: ParentalControlsPublicSessionDataSchema,
    config: ParentalControlsConfigurationSchema,
    lock: z.object({
      status: z.nativeEnum(LockStatusEnum),
      canBeUnlocked: z.boolean(),
    }),
  }),
})

export type ParentalControlPublicGetSessionAuthResponse = z.infer<
  typeof ParentalControlPublicGetSessionAuthResponseSchema
>

export const WebCategoryScheme = z.nativeEnum(WebCategory)

export const BlockActionCodeScheme = z.nativeEnum(BlockActionCode)
