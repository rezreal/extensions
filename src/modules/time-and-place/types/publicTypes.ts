import { z } from 'zod'
import { RRuleTemporal } from 'rrule-temporal'
import { LockStatusEnum, PartnerUserRoleEnum } from '@chasterapp/chaster-js'

const stringToRRule = z.custom<RRuleTemporal>(
  (i: string) => new RRuleTemporal({ rruleString: i }),
)

export type Geolocation = z.infer<typeof TimeAndPlaceConfigurationSchema>

export const GeolocationSchema = z.object({
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  /** Radius of the Location */
  maxDistance: z.optional(z.number().gte(5).lte(10000)),
  /** Description of the location */
  description: z.optional(z.string().nonempty()),
})

const UnlockationId = z.string().uuid()

export type Unlocktion = z.infer<typeof TimeAndPlaceConfigurationSchema>
const UnlockationScheme = z.object({
  id: UnlockationId,
  when: stringToRRule,
  howLong: z.string().duration(),
  where: GeolocationSchema,
})

export type TimeAndPlaceConfiguration = z.infer<
  typeof TimeAndPlaceConfigurationSchema
>

export const TimeAndPlaceConfigurationSchema = z.object({
  unlockations: z.array(UnlockationScheme),
})

export const TimeAndPlaceConfigurationDefault: TimeAndPlaceConfiguration = {
  unlockations: [],
}

export type TimeAndPlaceSessionData = z.infer<
  typeof TimeAndPlaceSessionDataScheme
>

export const TimeAndPlaceSessionDataScheme = z.object({
  unlocked: z.array(UnlockationId),
})

export const TimeAndPlaceSessionDataDefault: TimeAndPlaceSessionData = {
  unlocked: [],
}

export const TimeAndPlacePublicGetSessionAuthResponseSchema = z.object({
  role: z.nativeEnum(PartnerUserRoleEnum),
  session: z.object({
    slug: z.string(),

    data: TimeAndPlaceSessionDataScheme,
    config: TimeAndPlaceConfigurationSchema,
    lock: z.object({
      status: z.nativeEnum(LockStatusEnum),
      canBeUnlocked: z.boolean(),
    }),
  }),
})

export type TimeAndPlacePublicGetSessionAuthResponse = z.infer<
  typeof TimeAndPlacePublicGetSessionAuthResponseSchema
>
