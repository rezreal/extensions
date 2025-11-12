import {
  FormControl,
  FormHelperText,
  Stack,
  Typography,
  Checkbox,
} from '@mui/joy'

import type { UseFormReturn } from 'react-hook-form'
import type { PartnerConfigurationRoleEnum } from '@chasterapp/chaster-js'
import { FormGroup } from '@mui/material'

type Props = {
  form: UseFormReturn<ParentalControlsConfiguration>
  role: PartnerConfigurationRoleEnum
}

import {
  AppBlocking,
  PhonelinkLock,
  FilterAlt,
  PersonPinCircle,
  History,
} from '@mui/icons-material'
import { useId } from 'react'
import type {
  ParentalControlLockCapabilities,
  ParentalControlsConfiguration,
} from '@/modules/parental-controls/types/publicTypes'
import { ParentalControlLockCapabilitiesSchema } from '@/modules/parental-controls/types/publicTypes'
import { useTranslation } from 'react-i18next'

function iconForCapability(capability: ParentalControlLockCapabilities) {
  switch (capability) {
    case 'LOCK_DEVICES':
      return <PhonelinkLock />
    case 'FILTER_CONTENT':
      return <FilterAlt />
    case 'BLOCK_APPS':
      return <AppBlocking />
    case 'TRACK_ACTIVITY':
      return <History />
    case 'TRACK_LOCATION':
      return <PersonPinCircle />
  }
}

function CapabilitySelect({
  role,
  form: { getValues, setValue, watch },
}: Props) {
  const id = useId()
  const descriptionId = useId()
  const { t } = useTranslation()

  return (
    <>
      <Stack gap={0.5}>
        <Typography component="h2" level="title-lg" id={id}>
          {t('parental_controls.capabilities.title')}
        </Typography>
        <Typography id={descriptionId}>
          {t(`parental_controls.capabilities.description_for_${role}`)}
        </Typography>
      </Stack>
      <Stack
        role="group"
        aria-labelledby={id}
        aria-describedby={descriptionId}
        gap={1}
      >
        <FormGroup>
          {Object.values(ParentalControlLockCapabilitiesSchema.Values).map(
            (capability) => (
              <FormControl key={capability}>
                <Checkbox
                  size="lg"
                  checkedIcon={iconForCapability(capability)}
                  overlay
                  onChange={(e) =>
                    setValue(
                      'capabilities',
                      !e.target.checked
                        ? getValues('capabilities').filter(
                            (c) => c !== capability,
                          )
                        : [...getValues('capabilities'), capability],
                    )
                  }
                  checked={watch('capabilities').includes(capability)}
                  label={t(`parental_controls.capabilities.${capability}`)}
                />

                <FormHelperText>
                  {t(
                    `parental_controls.capabilities.${capability}_description_for_${role}`,
                  )}
                </FormHelperText>
              </FormControl>
            ),
          )}
        </FormGroup>
      </Stack>
    </>
  )
}

export default CapabilitySelect
