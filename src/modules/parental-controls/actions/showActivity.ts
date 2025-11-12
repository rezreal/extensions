'use server'

import type { TimelineEntry } from '@/modules/parental-controls/lib/qApi'
import { TimelineEntryType } from '@/modules/parental-controls/lib/qApi'
import { getEvents, getProfiles } from '@/modules/parental-controls/lib/qClient'
import { PartnerUserRoleEnum } from '@chasterapp/chaster-js/dist/api'
import { getValidatedSessionAuth } from '@/modules/parental-controls/lib/getValidatedSessionAuth'

export async function showActivity(
  mainToken: string,
): Promise<readonly TimelineEntry[]> {
  const auth = await getValidatedSessionAuth(mainToken)
  if (auth.role != PartnerUserRoleEnum.Keyholder) {
    throw new Error('Activity can only be shown for the keyholder.')
  }

  const session = auth.session

  const accounts = session.data.accounts
  let timelines: readonly TimelineEntry[] = []

  const showLocationEntries =
    session.config.capabilities.includes('TRACK_LOCATION')

  for (const account of accounts) {
    const profiles = await getProfiles(account.id, account.latestAccessToken)

    for (const profile of profiles) {
      const events = await getEvents(
        account.uid,
        account.latestAccessToken,
        profile.uid,
      )
      const userLock = auth.lockForUser
      // fixme: this date filter does not work! it must only show events within the duration of the lock
      const filteredTimeline = events.timeline.filter(
        (timelineEntry) =>
          Date.parse(timelineEntry.dt) > Date.parse(userLock.startDate) &&
          Date.parse(timelineEntry.dt) <
            (userLock.endDate
              ? Date.parse(userLock.endDate)
              : Number.MAX_VALUE) &&
          (showLocationEntries ||
            timelineEntry.type !== TimelineEntryType.Location),
      )

      timelines = [...timelines, ...filteredTimeline]
    }
  }
  return timelines
}
