'use client'

import Configuration from '@/modules/parental-controls/components/configuration/Configuration'
import type { ParentalControlPartnerConfigurationForPublic } from '@/modules/parental-controls/actions/getConfiguration'

type Props = {
  configuration: ParentalControlPartnerConfigurationForPublic
  token: string
}

const ParentalControlConfigurationView = ({ configuration, token }: Props) => {
  return <Configuration partnerConfiguration={configuration} token={token} />
}

export default ParentalControlConfigurationView
