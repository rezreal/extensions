import TimeAndPlaceSessionView from '@/modules/time-and-place/views/TimeAndPlaceSessionView'
import { getSessionData } from '@/modules/time-and-place/actions/getSessionData'

type Props = {
  params: {
    token: string
  }
}

export default async function Page({ params: { token } }: Props) {
  const auth = await getSessionData({ token })

  return <TimeAndPlaceSessionView auth={auth} token={token} />
}
