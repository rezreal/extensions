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
import type {
  QProfileRules,
  WebRuleCategory,
} from '@/modules/parental-controls/lib/qApi'
import { WebCategory } from '@/modules/parental-controls/lib/qApi'
import { logCustomAction } from '@/modules/extensions/actions/logCustomAction'
import { mapUserRoleToLogRole } from '@/modules/parental-controls/lib/mapUserToleToLogRole'
import { getValidatedSessionAuth } from '@/modules/parental-controls/lib/getValidatedSessionAuth'
import { WebCategoryScheme } from '@/modules/parental-controls/types/publicTypes'
import { z } from 'zod'

export async function setCategoryFilters(
  mainToken: string,
  categoryFilters: readonly WebCategory[],
): Promise<void> {
  const auth = await getValidatedSessionAuth(mainToken)

  z.array(WebCategoryScheme).parse(categoryFilters)

  if (!auth.session.config.capabilities.includes('FILTER_CONTENT')) {
    throw new Error('FILTER_CONTENT is not allowed for this lock.')
  }
  if (auth.role !== PartnerUserRoleEnum.Keyholder) {
    throw new Error('Only the keyholder may set category filters.')
  }

  const accounts = auth.session.data.accounts

  const categories: WebRuleCategory[] = categoryFilters.map((c) => ({
    action: 'BLOCK',
    category: c,
  }))

  for (const account of accounts) {
    const profiles = await getProfiles(account.id, account.latestAccessToken)

    for (const profile of profiles) {
      const rules: QProfileRules = await getProfileRules(
        account.id,
        profile.id,
        account.latestAccessToken,
      )
      const updatedRules = {
        ...rules,
        web: {
          ...rules.web,
          categories,
          is_category_list: categories.length > 0,
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
    await logCustomAction(auth.session.sessionId, {
      role: mapUserRoleToLogRole(auth.role),
      icon: PartnerCustomLogActionDtoIconEnum.Filter,
      title: '%USER% changed the website filter rules',
      description: `The following categories are now blocked: ${categories
        .map((c) => WebCategory[c.category])
        .join(', ')}`,
    })
  }
}
