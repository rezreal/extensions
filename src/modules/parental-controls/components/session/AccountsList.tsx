import { formatRelative } from 'date-fns'
import type { PartnerUserRoleEnum } from '@chasterapp/chaster-js/dist/api'
import {
  Button,
  Card,
  CardContent,
  CardCover,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Modal,
  ModalDialog,
  Stack,
  Typography,
} from '@mui/joy'
import {
  DesktopMac,
  Microsoft,
  PhoneAndroid,
  PhoneIphone,
  SevereCold,
  Refresh,
  WarningRounded,
} from '@mui/icons-material'
import Alert from '@mui/joy/Alert'
import { useTranslation } from '@/app/i18n/client'
import type {
  ParentalControlLockCapabilities,
  ParentalControlsDevice,
  ParentalControlsPublicAccount,
} from '@/modules/parental-controls/types/publicTypes'
import { ParentalControlExtensionPlatform } from '@/modules/parental-controls/types/publicTypes'
import { useState } from 'react'

function platformIcon(platform: ParentalControlExtensionPlatform) {
  switch (platform) {
    case ParentalControlExtensionPlatform.ANDROID:
      return <PhoneAndroid />
    case ParentalControlExtensionPlatform.IOS:
      return <PhoneIphone />
    case ParentalControlExtensionPlatform.MAC:
      return <DesktopMac />
    case ParentalControlExtensionPlatform.WINDOWS:
      return <Microsoft />
  }
}

function AccountsList({
  accounts,
  onRefresh,
  onLockdown: onFreeze,
  showRevokeLockdown: showUnfreeze,
  showLockdown: showFreeze,
  onUnlock,
  disabled,
  role,
}: {
  accounts: readonly ParentalControlsPublicAccount[]
  onRefresh: () => void
  onLockdown: () => void
  showRevokeLockdown: boolean
  showLockdown: boolean
  onUnlock: () => void
  disabled: boolean
  capabilities: readonly ParentalControlLockCapabilities[]
  role: PartnerUserRoleEnum
}) {
  const { t } = useTranslation(undefined, { keyPrefix: 'parental_controls' })

  const [showLockdownModal, setShowLockdownModal] = useState(false)

  return (
    <>
      <Typography typography="h3">{t(`accountList.title`)}</Typography>
      <Stack spacing={2}>
        <Typography>{t('accountList.summary')}</Typography>
        {accounts.map((a) => (
          <Card key={a.id} variant="soft">
            <CardContent>
              <Typography typography="h5">Account {a.email ?? a.id}</Typography>
              {a.frozen ? <Chip size="sm">Lockdown</Chip> : ''}
              <Chip size="sm">
                Linked {formatRelative(Date.parse(a.createdAt), new Date())},
                &nbsp;{a.devices.length}/{a.license.maxDevices} Devices,
                (License {a.license.type})
              </Chip>

              {a.devices.length == 0 ? t(`accountList.no_devices`) : ''}
              {a.devices.map((d: ParentalControlsDevice) => (
                <Card key={d.id} sx={{ width: 320 }}>
                  <CardCover>{platformIcon(d.platform)}</CardCover>
                  <CardContent>
                    <Typography level="title-lg">{d.name}</Typography>
                    <Chip variant="soft">{d.platform}</Chip>
                    <Chip>
                      last seen{' '}
                      {formatRelative(Date.parse(d.lastSeen), new Date())}
                    </Chip>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
        {showFreeze && accounts?.some((a) => !a.frozen) ? (
          <>
            <Button
              onClick={() => setShowLockdownModal(true)}
              disabled={disabled}
              color="danger"
              startDecorator={<SevereCold />}
            >
              {t(`accountList.freeze_accounts`)}
            </Button>

            <Modal
              open={showLockdownModal}
              onClose={() => setShowLockdownModal(false)}
            >
              <ModalDialog variant="outlined" role="alertdialog">
                <DialogTitle>
                  <WarningRounded />
                  Do you understand the consequences?
                </DialogTitle>
                <Divider />
                <DialogContent>
                  Are you sure you want to lockdown all accounts? With this
                  action, chaster will change the login name and password of all
                  linked Qustodio accounts. Neither you, nor the lockee will be
                  able to access the account until this lock is opened or
                  deserted. Only you can control the account from this
                  extension.
                </DialogContent>
                <DialogActions>
                  <Button
                    variant="solid"
                    color="danger"
                    startDecorator={<SevereCold />}
                    onClick={() => {
                      onFreeze()
                      setShowLockdownModal(false)
                    }}
                  >
                    {t(`accountList.freeze_accounts`)}
                  </Button>
                  <Button
                    variant="plain"
                    color="neutral"
                    onClick={() => setShowLockdownModal(false)}
                  >
                    Cancel
                  </Button>
                </DialogActions>
              </ModalDialog>
            </Modal>
          </>
        ) : (
          ''
        )}
        {accounts?.some((a) => a.frozen) && showUnfreeze ? (
          <Button onClick={onUnlock} disabled={disabled}>
            {t(`accountList.unfreze_accounts`)}
          </Button>
        ) : (
          ''
        )}
      </Stack>
      {accounts.length === 0 ? (
        <Alert color="warning">
          {t(`accountList.no_accounts_for_${role}`)}
        </Alert>
      ) : (
        ''
      )}

      <Button
        onClick={onRefresh}
        type="submit"
        loading={disabled}
        loadingPosition={'start'}
        color="primary"
        startDecorator={<Refresh />}
      >
        {t(`accountList.refresh`)}
      </Button>
    </>
  )
}

export default AccountsList
