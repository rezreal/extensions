'use client'

import Main from '../components/session/Main'
import type { ParentalControlPublicGetSessionAuthResponse } from '@/modules/parental-controls/types/publicTypes'

type Props = {
  auth: ParentalControlPublicGetSessionAuthResponse
  token: string
}

const ParentalControlSessionView = ({ auth, token }: Props) => {
  return <Main auth={auth} token={token} />
}

export default ParentalControlSessionView
