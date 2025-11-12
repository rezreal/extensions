import type { PartnerConfigurationRoleEnum } from '@chasterapp/chaster-js'
import { FormControl, FormHelperText, Stack } from '@mui/joy'
import { useTranslation } from 'react-i18next'
import FormCheckbox from '@/modules/ui/components/inputs/FormCheckbox'
import type { UseFormReturn } from 'react-hook-form'
import type { ParentalControlsConfiguration } from '@/modules/parental-controls/types/publicTypes'

type Props = {
  form: UseFormReturn<ParentalControlsConfiguration>
  role: PartnerConfigurationRoleEnum
}

const DisclaimerAlert = ({ role, form: { control } }: Props) => {
  const { t } = useTranslation()

  return (
    <Stack gap={0.5}>
      <FormControl>
        <FormCheckbox
          overlay
          control={control}
          name="hideChanges"
          label={t('parental_controls.hide_changes')}
        />
        <FormHelperText>
          {t(`parental_controls.hide_changes_description_for_${role}`)}
        </FormHelperText>
      </FormControl>
    </Stack>
  )
}

export default DisclaimerAlert
