'use client'

import { useTranslation } from '@/app/i18n/client'

import { Divider, Stack, Typography } from '@mui/joy'
import { useForm } from 'react-hook-form'
import { useSaveCapability } from '@/modules/base/hooks/useSaveCapability'
import type { TimeAndSpacePartnerConfigurationForPublic } from '../../actions/getConfiguration'
import type { TimeAndPlaceConfiguration } from '../../types/publicTypes'
import { updateConfiguration } from '../../actions/updateConfiguration'
import { PartnerConfigurationRoleEnum } from '@chasterapp/chaster-js'
import { RRule } from './RRule'

type Props = {
  configuration: TimeAndSpacePartnerConfigurationForPublic
  token: string
}

const Configuration = ({ configuration, token }: Props) => {
  const { t } = useTranslation('time-and-place')
  const role = configuration.role
  const defaultValues: TimeAndPlaceConfiguration = configuration.config

  const form = useForm<TimeAndPlaceConfiguration>({
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
          ? t('configuration.description_for_keyholder')
          : t('configuration.description_for_wearer')}
      </Typography>

      <Divider />
      <RRule onConfirm={() => {}} lang="en"></RRule>
    </Stack>
  )
}

export default Configuration
