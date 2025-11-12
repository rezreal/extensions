import type {
  ActionLogCreated,
  ExtensionSessionCreated,
  ExtensionSessionDeleted,
  ExtensionSessionUpdated,
} from '@chasterapp/chaster-js'
import {
  ActionLogCreatedEventEnum,
  ExtensionSessionCreatedEventEnum,
  ExtensionSessionDeletedEventEnum,
  ExtensionSessionUpdatedEventEnum,
} from '@chasterapp/chaster-js/dist/api'
import type { NextRequest } from 'next/server'
import { isBasicAuthed } from '@/lib/webhooks'
import { getSession } from '@/modules/parental-controls/lib/getSession'
import { unfreezeAccount } from '@/modules/parental-controls/actions/unfreezeAccounts'

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
    if (slug !== 'parental-controls') {
      return new Response(null, {
        status: 400,
        statusText: 'Sending data for wrong extension.',
      })
    }
  }

  console.info('webhook request:', request)
  console.info('webhook request body:', webhookEvent)

  if (webhookEvent.event === ActionLogCreatedEventEnum.ActionLogCreated) {
    if (
      webhookEvent.data.actionLog.type === 'unlocked' ||
      webhookEvent.data.actionLog.type === 'deserted'
    ) {
      const sessionId = webhookEvent.data.sessionId
      const { data } = await getSession(sessionId)

      let allGood = true
      for (const account of data.accounts) {
        try {
          await unfreezeAccount(sessionId, data, account)
        } catch (e) {
          console.warn(
            `Failed to unfreeze account ${account.id} in session ${sessionId}.`,
          )
          allGood = false
        }
      }
      if (!allGood) {
        throw new Error(
          `Could not unfreeze all accounts for session ${sessionId}`,
        )
      }
    }
  }

  return new Response(null, { status: 204 })
}
