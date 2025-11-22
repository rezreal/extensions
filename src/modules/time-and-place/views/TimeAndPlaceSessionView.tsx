'use client'

import Main from '../components/session/Main'
import type { TimeAndPlacePublicGetSessionAuthResponse } from '@/modules/time-and-place/types/publicTypes'

type Props = {
  auth: TimeAndPlacePublicGetSessionAuthResponse
  token: string
}

const TimeAndPlaceSessionView = ({ auth }: Props) => {
  return <Main auth={auth} />
}

export default TimeAndPlaceSessionView
