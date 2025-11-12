import type { PartnerConfigurationRoleEnum } from '@chasterapp/chaster-js'
import { Alert, Box, FormControl, FormHelperText, Stack } from '@mui/joy'
import { useTranslation } from 'react-i18next'
import FormCheckbox from '@/modules/ui/components/inputs/FormCheckbox'
import type { UseFormReturn } from 'react-hook-form'
import type { ParentalControlsConfiguration } from '@/modules/parental-controls/types/publicTypes'
import { Warning } from '@mui/icons-material'

type Props = {
  form: UseFormReturn<ParentalControlsConfiguration>
  role: PartnerConfigurationRoleEnum
}

const LockAccount = ({ role, form: { control, watch } }: Props) => {
  const { t } = useTranslation()

  return (
    <Stack gap={0.5}>
      <FormControl>
        <FormCheckbox
          overlay
          color="warning"
          checkedIcon={<Warning />}
          control={control}
          name="allowAccountFreezing"
          label={t(`parental_controls.account_freezing`)}
        />
        <FormHelperText>
          {t(`parental_controls.account_freezing_description_for_${role}`)}
        </FormHelperText>
      </FormControl>

      {watch('allowAccountFreezing') ? (
        <Alert
          color="warning"
          startDecorator={<Warning />}
          hidden={watch('allowAccountFreezing')}
        >
          <Box>{t(`parental_controls.account_freezing_warning`)}</Box>
        </Alert>
      ) : (
        ''
      )}
    </Stack>
  )
}

export default LockAccount
