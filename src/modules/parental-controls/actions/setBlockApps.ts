'use server'

import {
  PartnerCustomLogActionDtoIconEnum,
  PartnerUserRoleEnum,
} from '@chasterapp/chaster-js'
import {
  getProfileRules,
  getProfiles,
  updateRulesForProfile,
} from '../lib/qClient'
import type { QProfileRules } from '@/modules/parental-controls/lib/qApi'
import { BlockActionCode } from '@/modules/parental-controls/lib/qApi'
import { logCustomAction } from '@/modules/extensions/actions/logCustomAction'
import { mapUserRoleToLogRole } from '@/modules/parental-controls/lib/mapUserToleToLogRole'
import { getValidatedSessionAuth } from '@/modules/parental-controls/lib/getValidatedSessionAuth'
import { z } from 'zod'
import { BlockActionCodeScheme } from '@/modules/parental-controls/types/publicTypes'

export async function setBlockApps(
  mainToken: string,
  appRules: Record<string, BlockActionCode>,
): Promise<void> {
  const auth = await getValidatedSessionAuth(mainToken)

  if (auth.session.config.capabilities.includes('BLOCK_APPS')) {
    throw new Error('BLOCK_APPS is not allowed for this lock.')
  }
  if (auth.role !== PartnerUserRoleEnum.Keyholder) {
    throw new Error('Only the keyholder may set category filters.')
  }

  const parsedAppRules = z.record(BlockActionCodeScheme).parse(appRules)

  const accounts = auth.session.data.accounts

  for (const account of accounts) {
    const profiles = await getProfiles(account.id, account.latestAccessToken)

    for (const profile of profiles) {
      const rules: QProfileRules = await getProfileRules(
        account.id,
        profile.id,
        account.latestAccessToken,
      )
      const updateApplicationList = rules.app_rules.application_list.map(
        (rule) => ({
          ...rule,
          action:
            (rule.id ? parsedAppRules[rule.id] : undefined) ?? rule.action,
        }),
      )

      const updatedRules: QProfileRules = {
        ...rules,
        app_rules: {
          ...rules.app_rules,
          is_application_list: updateApplicationList.length > 0,
          application_list: updateApplicationList,
        },
      }
      await updateRulesForProfile(
        account.latestAccessToken,
        account.id,
        updatedRules,
      )
    }
  }

  if (!auth.session.config.hideChanges) {
    const blockedMessage = `The following apps are now blocked: ${Object.entries(
      parsedAppRules,
    )
      .filter((action) => action[1] === BlockActionCode.BLOCK)
      .map((action) => action[0]) //fixme: app names here
      .join(', ')}`

    await logCustomAction(auth.session.sessionId, {
      role: mapUserRoleToLogRole(auth.role),
      icon: PartnerCustomLogActionDtoIconEnum.Filter,
      title: '%USER% changed the app filter rules',
      description: blockedMessage,
    })
  }
}
