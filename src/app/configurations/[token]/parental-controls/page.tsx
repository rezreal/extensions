import ParentalControlConfigurationView from '@/modules/parental-controls/views/ParentalControlConfigurationView'
import { getConfiguration } from '@/modules/parental-controls/actions/getConfiguration'

type Props = {
  params: {
    token: string
  }
}

export default async function Page({ params: { token } }: Props) {
  const configuration = await getConfiguration({ token: token })

  return (
    <ParentalControlConfigurationView
      configuration={configuration}
      token={token}
    />
  )
}
