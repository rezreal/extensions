import ParentalControlSessionView from '@/modules/parental-controls/views/ParentalControlSessionView'
import { getSessionData } from '@/modules/parental-controls/actions/getSessionData'

type Props = {
  params: {
    token: string
  }
}

export default async function Page({ params: { token } }: Props) {
  const auth = await getSessionData({ token })

  return <ParentalControlSessionView auth={auth} token={token} />
}
