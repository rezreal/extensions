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

export async function setDomainFilters(
  mainToken: string,
  domainFilters: Record<string, BlockActionCode>,
): Promise<void> {
  const auth = await getValidatedSessionAuth(mainToken)
  if (!auth.session.config.capabilities.includes('FILTER_CONTENT')) {
    throw new Error('FILTER_CONTENT is not allowed for this lock.')
  }
  if (auth.role !== PartnerUserRoleEnum.Keyholder) {
    throw new Error('Only the keyholder may set domain filters.')
  }

  const accounts = auth.session.data.accounts

  // chaster.app will always be whitelisted to allow emergency communication!
  const updatedDomains = {
    ...domainFilters,
    'chaster.app': BlockActionCode.ALLOW,
  }

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
        app_rules: { ...rules.app_rules, application_list: [] },
        web: { ...rules.web, domains: updatedDomains, is_domain_list: true },
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
      description: `The following website rules are in place: ${Object.keys(
        domainFilters,
      )
        .map(
          (domain) => `${domain} (${BlockActionCode[domainFilters[domain]]})`,
        )
        .join(', ')}`,
    })
  }
}
