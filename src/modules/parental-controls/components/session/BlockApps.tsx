import { Stack, Typography } from '@mui/joy'
import type { AppRule } from '../../lib/qApi'
import { BlockActionCode } from '../../lib/qApi'
import { useTranslation } from '@/app/i18n/client'

function BlockApps({
  apps,
  disabled,
  onChange,
}: {
  apps: readonly AppRule[]
  disabled: boolean
  onChange: (apps: Record<string, BlockActionCode>) => void
}) {
  const filteredApps = apps.filter((a) => (a.id || a.exe) && a.blockable)
  const { t } = useTranslation(undefined, { keyPrefix: 'parental_controls' })

  return (
    <>
      <Stack gap={0.5}>
        <Typography component="h2" level="title-lg">
          {t('blockApps.title')}
        </Typography>
        <Typography>{t(`blockApps.description`)}</Typography>
      </Stack>
      <Stack role="group" gap={1}>
        <form>
          {filteredApps?.map((app) => (
            <div
              aria-disabled={disabled}
              key={app.id || app.exe}
              className="CheckboxListGroupItem checkbox-list-group-item list-group-item"
            >
              <div className="CheckboxGroupItem">
                <div className="checkbox-checkbox">
                  <div className="CustomCheckbox">
                    <input
                      id={`app${app.id || app.exe}`}
                      type="checkbox"
                      disabled={disabled}
                      onChange={(e) =>
                        onChange(
                          apps
                            .map((a) =>
                              a.id === app.id &&
                              a.exe === app.exe &&
                              a.profile == app.profile
                                ? {
                                    ...app,
                                    action: e.target.checked
                                      ? BlockActionCode.BLOCK
                                      : BlockActionCode.ALLOW,
                                  }
                                : a,
                            )
                            .filter((a) => !!a.id && !!a.action)
                            .reduce(
                              (akk, nxt) => ({
                                ...akk,
                                [nxt.id!]: nxt.action,
                              }),
                              {},
                            ),
                        )
                      }
                      checked={app.action === BlockActionCode.BLOCK}
                    />
                    <span className="checkmark">
                      <span className="check">🔒</span>
                    </span>
                  </div>
                </div>
                <label htmlFor={`app${app.id || app.exe}`}>
                  <div className="checkbox-label">
                    <img
                      className="appIcon"
                      referrerPolicy="no-referrer"
                      alt={app.name}
                      src={app.thumbnail?.replace('s3://', 'https://') || ''}
                    />
                    PLATFORM ICON HERE
                    <div className="checkbox-label-title">
                      {app.name} ({app.exe})
                    </div>
                    <div className="caption"></div>
                  </div>
                </label>
              </div>
            </div>
          ))}
        </form>
      </Stack>
    </>
  )
}

export default BlockApps
