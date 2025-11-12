'use server'

import type { ParentalControlsSessionData } from '@/modules/parental-controls/types/internalTypes'
import { PartnerUserRoleEnum } from '@chasterapp/chaster-js/dist/api'
import {
  getProfileRules,
  getProfiles,
} from '@/modules/parental-controls/lib/qClient'
import type { QProfileRules } from '@/modules/parental-controls/lib/qApi'
import type { QustodioExtensionProfileRulesView } from '@/modules/parental-controls/types/publicTypes'
import { getValidatedSessionAuth } from '@/modules/parental-controls/lib/getValidatedSessionAuth'

type Params = {
  token: string
}

export async function getRules({
  token,
}: Params): Promise<QustodioExtensionProfileRulesView> {
  const auth = await getValidatedSessionAuth(token)

  const session = auth.session

  if (auth.role !== PartnerUserRoleEnum.Keyholder) {
    throw new Error('Only the keyholder can fetch the rules')
  }

  const sessionData: ParentalControlsSessionData = session.data

  const rulesList = []
  for (const account of sessionData.accounts) {
    const profiles = await getProfiles(account.id, account.latestAccessToken)
    if (profiles.length === 0) {
      continue
    }
    const profile = profiles[0]
    const rules: QProfileRules = await getProfileRules(
      account.id,
      profile.id,
      account.latestAccessToken,
    )
    rulesList.push(rules)
  }

  return {
    ...rulesList[0],
    app_rules: {
      ...rulesList[0].app_rules,
      application_list: rulesList
        .map((r) => r.app_rules.application_list)
        .reduce((results, item) => [...results, ...item], []),
    },
  }
}
