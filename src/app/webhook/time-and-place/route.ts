import 'server-only'

import type {
  ActionLogCreated,
  ExtensionSessionCreated,
  ExtensionSessionDeleted,
  ExtensionSessionUpdated,
} from '@chasterapp/chaster-js'
import {
  ExtensionSessionCreatedEventEnum,
  ExtensionSessionDeletedEventEnum,
  ExtensionSessionUpdatedEventEnum,
  PartnerExtensionsApi,
} from '@chasterapp/chaster-js/dist/api'
import type { NextRequest } from 'next/server'
import { isBasicAuthed } from '@/lib/webhooks'
import {
  TimeAndPlaceConfigurationSchema,
  TimeAndPlaceSessionDataScheme,
} from '@/modules/time-and-place/types/publicTypes'
import { createApiInstance } from '@/modules/network/helpers/createApiInstance'

type WebhookEvent =
  | ExtensionSessionCreated
  | ExtensionSessionUpdated
  | ExtensionSessionDeleted
  | ActionLogCreated

export async function POST(request: NextRequest) {
  if (!isBasicAuthed(request)) {
    return new Response(null, { status: 401, statusText: 'Not Authorized' })
  }
  if (request.headers.get('content-type') !== 'application/json') {
    return new Response(null, { status: 415 })
  }

  const webhookEvent = (await request.json()) as WebhookEvent
  if (
    webhookEvent.event ===
      ExtensionSessionCreatedEventEnum.ExtensionSessionCreated ||
    webhookEvent.event ===
      ExtensionSessionUpdatedEventEnum.ExtensionSessionUpdated ||
    webhookEvent.event ===
      ExtensionSessionDeletedEventEnum.ExtensionSessionDeleted
  ) {
    const slug = webhookEvent.data.extension.slug
    if (slug !== 'time-and-place') {
      return new Response(null, {
        status: 400,
        statusText: 'Sending data for wrong extension.',
      })
    }
  }

  if (
    webhookEvent.event ===
      ExtensionSessionCreatedEventEnum.ExtensionSessionCreated ||
    webhookEvent.event ===
      ExtensionSessionUpdatedEventEnum.ExtensionSessionUpdated
  ) {
    const data = TimeAndPlaceSessionDataScheme.parse(
      webhookEvent.data.session.data,
    )
    const config = TimeAndPlaceConfigurationSchema.parse(
      webhookEvent.data.session.config,
    )

    const unfinishedUnlockations = config.unlockations.filter((u) =>
      data.unlocked.includes(u.id),
    )
    if (unfinishedUnlockations.length > 0) {
      const response = await createApiInstance(
        PartnerExtensionsApi,
      ).patchExtensionSession(webhookEvent.data.session.sessionId, {
        metadata: {
          ...webhookEvent.data.session.metadata,
          reasonsPreventingUnlocking: [
            `${unfinishedUnlockations.length} times and places are missing`,
          ],
        },
      })
      if (response.status >= 300) {
        return new Response(null, {
          status: response.status,
          statusText: response.statusText,
        })
      }
    }
  }

  return new Response(null, { status: 204 })
}
