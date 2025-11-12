import { useState } from 'react'
import { addAccount } from '@/modules/parental-controls/actions/addAccount'

import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Link,
  Snackbar,
  Stack,
  Typography,
} from '@mui/joy'
import { useTranslation } from '@/app/i18n/client'
import Alert from '@mui/joy/Alert'
import { useForm } from 'react-hook-form'
import {
  CheckOutlined,
  Publish,
  Error,
  Warning,
  Send,
} from '@mui/icons-material'
import type {
  ParentalControlAccountAdd,
  ParentalControlPublicGetSessionAuthResponse,
} from '@/modules/parental-controls/types/publicTypes'
import { isError } from 'util'

function LinkAccount({
  auth,
  token,
}: {
  auth: ParentalControlPublicGetSessionAuthResponse
  token: string
  onAdded: () => void
}) {
  const { t } = useTranslation(undefined, { keyPrefix: 'parental_controls' })

  const [error, setErrorState] = useState<string | undefined>(undefined)
  const [showSuccessSnack, setShowSuccessSnack] = useState(false)
  const [showErrorSnack, setShowErrorSnack] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const defaultValues = {
    email: '',
    password: '',
  }
  const { getValues, setValue, watch, reset, setError } =
    useForm<ParentalControlAccountAdd>({
      defaultValues,
    })

  return (
    <>
      <Typography typography="h3">{t('linkAccount.title')}</Typography>
      <Typography>{t('linkAccount.summary')}</Typography>
      {auth.session.config.allowAccountFreezing ? (
        <Alert color="warning" startDecorator={<Warning />}>
          {t('linkAccount.freezeWarning')}
        </Alert>
      ) : (
        ''
      )}

      <form
        onSubmit={async (event) => {
          event.preventDefault()
          setSubmitting(true)
          const formValue = getValues()
          try {
            await addAccount(token, formValue)
            setValue('email', '')
            setValue('password', '')
            setShowSuccessSnack(true)
            setShowErrorSnack(false)
            reset()
          } catch (error) {
            if (isError(error)) {
              setShowErrorSnack(true)
              setError('root', { message: error.message })
              setErrorState(error.message)
            } else throw error
          } finally {
            setSubmitting(false)
          }
        }}
      >
        <Stack spacing={2}>
          <FormControl key="email">
            <FormLabel>{t('linkAccount.email.label')}</FormLabel>
            <Input
              autoComplete="email"
              data-1p-ignore
              disabled={submitting}
              required={true}
              placeholder={t('linkAccount.email.placeholder')}
              type="email"
              onChange={(e) => setValue('email', e.target.value)}
              value={watch('email')}
            />
          </FormControl>
          <FormControl key="password">
            <FormLabel>{t('linkAccount.password.label')}</FormLabel>
            <Input
              autoComplete="current-password"
              type="password"
              required={true}
              disabled={submitting}
              placeholder={t('linkAccount.password.placeholder')}
              value={watch('password')}
              onChange={(e) => setValue('password', e.target.value)}
            />
          </FormControl>

          <Button
            type="submit"
            loading={submitting}
            loadingPosition={'start'}
            color="primary"
            startDecorator={<Send />}
          >
            {t('linkAccount.submit')}
          </Button>
        </Stack>
      </form>

      <Typography>
        Or &nbsp;
        <Link
          href="https://www.qustodio.com/en/free-sign-up/"
          rel={'noreferrer'}
          target={'_blank'}
        >
          Create your FREE Qustodio account now
        </Link>
      </Typography>

      <Snackbar
        variant="soft"
        color="success"
        open={showSuccessSnack}
        onClose={() => setShowSuccessSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        startDecorator={<CheckOutlined />}
        endDecorator={
          <Button
            onClick={() => setShowSuccessSnack(false)}
            size="sm"
            variant="soft"
            color="success"
          >
            {t('dismiss')}
          </Button>
        }
      >
        {t('linkAccount.success')}
      </Snackbar>

      <Snackbar
        variant="soft"
        color="neutral"
        open={submitting}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        startDecorator={<Publish />}
      >
        ... Adding Account. Please wait, this can take some time...
      </Snackbar>

      <Snackbar
        variant="soft"
        open={showErrorSnack && !!error}
        color="danger"
        onClose={() => setShowErrorSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        startDecorator={<Error />}
        endDecorator={
          <Button
            onClick={() => setShowErrorSnack(false)}
            size="sm"
            variant="soft"
            color="danger"
          >
            {t('dismiss')}
          </Button>
        }
      >
        {error}
      </Snackbar>
    </>
  )
}

export default LinkAccount
