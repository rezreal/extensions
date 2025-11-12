'use server'

import { getValidatedSessionAuth } from '@/modules/parental-controls/lib/getValidatedSessionAuth'
import type {
  ParentalControlsAccount,
  ParentalControlsSessionData,
} from '@/modules/parental-controls/types/internalTypes'
import { ParentalControlsSessionDataSchema } from '@/modules/parental-controls/types/internalTypes'
import { getDevices } from '@/modules/parental-controls/lib/qClient'
import { patchExtensionSession } from '@/modules/extensions/actions/patchExtensionSession'
import type { QDevice } from '@/modules/parental-controls/lib/qApi'
import { mapPlatform } from '@/modules/parental-controls/lib/mapPlatform'
import type { ParentalControlsDevice } from '@/modules/parental-controls/types/publicTypes'

export async function syncAccounts(
  mainToken: string,
): Promise<readonly ParentalControlsAccount[]> {
  const auth = await getValidatedSessionAuth(mainToken)

  const currentData: ParentalControlsSessionData = auth.session.data
  const accounts: ParentalControlsAccount[] = currentData.accounts
  const updatedAccounts: ParentalControlsAccount[] = []

  for (const acc of accounts) {
    const qDevices = await getDevices(acc.id, acc.latestAccessToken)

    const updatedDevices: ParentalControlsDevice[] = []
    for (const dev of acc.devices) {
      const matchingDevice = qDevices.find((qd) => qd.id === dev.id)
      if (matchingDevice) {
        updatedDevices.push({
          ...dev,
          lastSeen: matchingDevice.lastseen,
          name: matchingDevice.name,
          platform: mapPlatform(matchingDevice.platform),
          enabled: matchingDevice.enabled === 1,
        })
      }
    }
    // new devices
    qDevices
      .filter((qd) => !acc.devices.some((d) => qd.id == d.id))
      .forEach((qd: QDevice) => {
        updatedDevices.push({
          id: qd.id,
          name: qd.name,
          platform: mapPlatform(qd.platform),
          lastSeen: qd.lastseen,
          enabled: qd.enabled === 1,
        })
      })

    updatedAccounts.push({ ...acc, devices: updatedDevices })
  }

  const dataBuild = { ...currentData, accounts: updatedAccounts }
  console.info(dataBuild.accounts[0].devices)

  const data = ParentalControlsSessionDataSchema.parse(dataBuild)
  await patchExtensionSession(auth.session.sessionId, { data })

  return updatedAccounts
}
