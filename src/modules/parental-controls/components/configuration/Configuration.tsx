import { useTranslation } from '@/app/i18n/client'

import { PartnerConfigurationRoleEnum } from '@chasterapp/chaster-js'
import { Divider, Stack, Typography } from '@mui/joy'
import { useForm } from 'react-hook-form'
import { useSaveCapability } from '@/modules/base/hooks/useSaveCapability'

import LockAccount from '@/modules/parental-controls/components/configuration/LockAccount'

import CapabilitySelect from '@/modules/parental-controls/components/configuration/CapabilitySelect'
import type { ParentalControlPartnerConfigurationForPublic } from '@/modules/parental-controls/actions/getConfiguration'
import type { ParentalControlsConfiguration } from '@/modules/parental-controls/types/publicTypes'
import HideChanges from '@/modules/parental-controls/components/configuration/HideChanges'
import { updateConfiguration } from '@/modules/parental-controls/actions/updateConfiguration'

type Props = {
  partnerConfiguration: ParentalControlPartnerConfigurationForPublic
  token: string
}

const Configuration = ({ partnerConfiguration, token }: Props) => {
  const { t } = useTranslation()
  const role = partnerConfiguration.role
  const defaultValues: ParentalControlsConfiguration =
    partnerConfiguration.config

  const form = useForm<ParentalControlsConfiguration>({
    defaultValues,
  })

  useSaveCapability({
    onSave: async () => {
      const configuration = form.getValues()
      await updateConfiguration({ token, configuration })
    },
  })

  return (
    <Stack p={2} gap={2}>
      <Typography>
        {role === PartnerConfigurationRoleEnum.Keyholder
          ? t('parental_controls.description_for_keyholder')
          : t('parental_controls.description_for_wearer')}
      </Typography>
      <Divider />
      <CapabilitySelect role={role} form={form} />
      <Divider />
      <HideChanges role={role} form={form} />
      <Divider />
      <LockAccount role={role} form={form} />
    </Stack>
  )
}

export default Configuration
