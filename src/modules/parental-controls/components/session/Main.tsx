import { useEffect, useState } from 'react'

import AccountsList from './AccountsList'
import Activity from './Activity'

import FilterContent from './FilterContent'
import FilterDomains from './FilterDomains'

import type {
  BlockActionCode,
  TimelineEntry,
  WebCategory,
} from '../../lib/qApi'
import { showActivity } from '../../actions/showActivity'
import { LockStatusEnum, PartnerUserRoleEnum } from '@chasterapp/chaster-js'
import { getRules } from '../../actions/getRules'
import { syncAccounts } from '../../actions/syncAccounts'
import { lockdownAccounts } from '@/modules/parental-controls/actions/lockdownAccounts'
import { unfreezeAccounts } from '@/modules/parental-controls/actions/unfreezeAccounts'
import BlockApps from './BlockApps'
import LinkAccount from './LinkAccount'
import { setCategoryFilters } from '@/modules/parental-controls/actions/setCategoryFilters'
import { setBlockApps } from '../../actions/setBlockApps'
import { setDomainFilters } from '@/modules/parental-controls/actions/setDomainFilters'
import { CircularProgress, Divider, Stack } from '@mui/joy'
import type {
  ParentalControlPublicGetSessionAuthResponse,
  QustodioExtensionProfileRulesView,
} from '@/modules/parental-controls/types/publicTypes'
import { WebCategoryScheme } from '@/modules/parental-controls/types/publicTypes'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import LocationHistory from './LocationHistory'

type Props = {
  auth: ParentalControlPublicGetSessionAuthResponse
  token: string
}

function Main({ auth, token }: Props) {
  const [activity, setActivity] = useState<
    readonly TimelineEntry[] | undefined
  >()
  const [rules, setRules] = useState<
    QustodioExtensionProfileRulesView | undefined
  >()

  const [loading, setLoading] = useState<boolean>(false)

  const filterContentFormSchema = z.object({
    categories: z.array(WebCategoryScheme),
  })

  const filterContentForm = useForm<{ categories: WebCategory[] }>({
    resolver: zodResolver(filterContentFormSchema),
    values: {
      categories:
        rules?.web.categories
          .filter((b) => b.action === 'BLOCK')
          .map((a) => a.category) ?? [],
    },
  })

  const onSubmit: SubmitHandler<{ categories: WebCategory[] }> = async (e) => {
    setLoading(true)
    try {
      await setCategoryFilters(token, e.categories)
    } finally {
      setLoading(false)
    }
    setRules((r) =>
      r
        ? {
            ...r,
            web: {
              ...r.web,
              categories: e.categories.map((c) => ({
                category: c,
                action: 'BLOCK',
              })),
            },
          }
        : undefined,
    )
  }

  const formHandler = filterContentForm.handleSubmit(onSubmit)

  useEffect(() => {
    async function f() {
      if (
        auth.session.config.capabilities.includes('TRACK_ACTIVITY') &&
        auth.role === PartnerUserRoleEnum.Keyholder
      ) {
        const activity: readonly TimelineEntry[] = await showActivity(token)
        setActivity(activity)
      }
    }

    f().catch((e) => console.error(e))
  }, [token, auth.role])

  useEffect(() => {
    async function f() {
      if (auth.role !== PartnerUserRoleEnum.Keyholder) return
      setRules(await getRules({ token }))
    }
    f().catch((e) => console.error(e))
  }, [token, auth.role])

  async function doSyncAccounts() {
    setLoading(true)
    try {
      await syncAccounts(token)
    } finally {
      setLoading(false)
    }
  }

  async function doLockdownAccounts() {
    setLoading(true)
    try {
      await lockdownAccounts(token)
    } finally {
      setLoading(false)
    }
  }

  async function doUnfreezeAccounts() {
    setLoading(true)
    try {
      await unfreezeAccounts(token)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack p={2} gap={2}>
        {auth.role === PartnerUserRoleEnum.Keyholder &&
        auth.session.lock.status === LockStatusEnum.Locked &&
        auth.session.data.accounts.length > 0 ? (
          <>
            {auth.session.config.capabilities.includes('TRACK_ACTIVITY') ? (
              rules && activity ? (
                <Activity events={activity} />
              ) : (
                <CircularProgress />
              )
            ) : (
              ''
            )}
            {auth.session.config.capabilities.includes('TRACK_LOCATION') ? (
              rules && activity ? (
                <LocationHistory events={activity} />
              ) : (
                <CircularProgress />
              )
            ) : (
              ''
            )}

            {rules &&
            auth.session.config.capabilities.includes('FILTER_CONTENT') ? (
              <FilterContent
                form={filterContentForm}
                formHandler={formHandler}
                disabled={loading}
              />
            ) : (
              ''
            )}

            {rules &&
            auth.session.config.capabilities.includes('FILTER_CONTENT') ? (
              <FilterDomains
                disabled={loading}
                domains={rules.web.domains}
                onChange={onDomainsChanged}
              />
            ) : (
              ''
            )}

            {auth.session.config.capabilities.includes('BLOCK_APPS') ? (
              rules ? (
                <BlockApps
                  disabled={loading}
                  apps={rules.app_rules.application_list || []}
                  onChange={(e) => onAppsBlocked(e)}
                />
              ) : (
                <CircularProgress />
              )
            ) : (
              ''
            )}
          </>
        ) : (
          ''
        )}

        {auth.role === PartnerUserRoleEnum.Keyholder &&
        auth.session.lock.status === LockStatusEnum.Locked ? (
          <AccountsList
            accounts={auth.session.data.accounts}
            disabled={loading}
            onRefresh={doSyncAccounts}
            onLockdown={doLockdownAccounts}
            onUnlock={doUnfreezeAccounts}
            showRevokeLockdown={true}
            showLockdown={auth.session.config.allowAccountFreezing}
            capabilities={auth.session.config.capabilities}
            role={auth.role}
          />
        ) : (
          ''
        )}

        {auth.role === PartnerUserRoleEnum.Wearer &&
        auth.session.lock.status === LockStatusEnum.Locked ? (
          <>
            <LinkAccount
              auth={auth}
              token={token}
              onAdded={() => doSyncAccounts()}
            />
            <Divider />
            <AccountsList
              accounts={auth.session.data.accounts}
              disabled={loading}
              onRefresh={doSyncAccounts}
              onLockdown={doLockdownAccounts}
              onUnlock={doUnfreezeAccounts}
              showLockdown={false}
              showRevokeLockdown={
                auth.role !== PartnerUserRoleEnum.Wearer ||
                auth.session.lock.canBeUnlocked
              }
              capabilities={auth.session.config.capabilities}
              role={auth.role}
            />
          </>
        ) : (
          ''
        )}
      </Stack>
    </>
  )

  async function onAppsBlocked(rules: Record<string, BlockActionCode>) {
    setLoading(true)
    try {
      await setBlockApps(token, rules)
      const newRules = await getRules({ token })
      setRules(newRules)
    } finally {
      setLoading(false)
    }
  }

  async function onDomainsChanged(e: Record<string, BlockActionCode>) {
    setLoading(true)
    const filtered = { ...e }
    Object.keys(filtered).forEach((key) =>
      filtered[key] === undefined ? delete filtered[key] : {},
    )

    try {
      await setDomainFilters(token, filtered)
    } finally {
      setLoading(false)
    }
    setRules((r) =>
      r ? { ...r, web: { ...r.web, domains: filtered } } : undefined,
    )
  }
}

export default Main
