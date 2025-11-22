import { getConfiguration } from '@/modules/time-and-place/actions/getConfiguration'
import Configuration from '@/modules/time-and-place/components/configuration/Configuration'

type Props = {
  params: {
    token: string
  }
}

export default async function Page({ params: { token } }: Props) {
  const configuration = await getConfiguration({ token: token })

  return <Configuration configuration={configuration} token={token} />
}
