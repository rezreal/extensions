import { cardConfigurationSchema } from '@/modules/cards/models/card-configuration'
import { emergencyUnlockConfigurationSchema } from '@/modules/emergency-unlock/types/emergencyUnlockConfiguration'
import type { Extension } from '@/modules/extensions/types/Extension'
import { keyholderAiConfigurationSchema } from '@/modules/keyholder-ai/domain/models/keyholder-ai-configuration'
import { ParentalControlsConfigurationSchema } from '@/modules/parental-controls/types/publicTypes'

export const extensions: Extension[] = [
  {
    internalId: 'emergency-unlock',
    displayName: 'Emergency unlock',
    configurationSchema: emergencyUnlockConfigurationSchema,
  },
  {
    internalId: 'cards',
    displayName: 'Cards',
    configurationSchema: cardConfigurationSchema,
  },
  {
    internalId: 'keyholder-ai',
    displayName: 'Keyholder AI',
    configurationSchema: keyholderAiConfigurationSchema,
  },
  {
    internalId: 'parental-controls',
    displayName: 'Parental Controls',
    configurationSchema: ParentalControlsConfigurationSchema,
  },
  {
    internalId: 'time-and-place',
    displayName: 'Time & Place',
    configurationSchema: ParentalControlsConfigurationSchema,
  },
]

export const extensionBySlug = (slug: string) => {
  const extension = extensions.find((e) => e.internalId === slug)
  if (!extension) {
    throw new Error(`Extension with slug ${slug} not found`)
  }
  return extension
}
