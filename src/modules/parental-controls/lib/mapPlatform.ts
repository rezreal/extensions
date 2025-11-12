import { Platform } from '@/modules/parental-controls/lib/qApi'
import { ParentalControlExtensionPlatform } from '@/modules/parental-controls/types/publicTypes'

export function mapPlatform(
  platform: Platform,
): ParentalControlExtensionPlatform {
  switch (platform) {
    case Platform.Windows:
      return ParentalControlExtensionPlatform.WINDOWS
    case Platform.Mac:
      return ParentalControlExtensionPlatform.MAC
    case Platform.IOS:
      return ParentalControlExtensionPlatform.IOS
    case Platform.Android:
      return ParentalControlExtensionPlatform.ANDROID
  }
}
