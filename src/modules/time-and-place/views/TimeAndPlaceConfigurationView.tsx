'use client'

import Configuration from '@/modules/time-and-place/components/configuration/Configuration'
import type { TimeAndSpacePartnerConfigurationForPublic } from '../actions/getConfiguration'

type Props = {
  configuration: TimeAndSpacePartnerConfigurationForPublic
  token: string
}

const TimeAndPlaceConfigurationView = ({ configuration, token }: Props) => {
  return <Configuration configuration={configuration} token={token} />
}

export default TimeAndPlaceConfigurationView
