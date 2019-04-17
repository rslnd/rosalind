import React from 'react'
import { ReferralsContainer } from '../referrals/ReferralsContainer'
import { appointmentStyle } from './Appointment'

export const Referrals = ({ appointment }) =>
  !appointment
    ? null
    : <ReferralsContainer appointment={appointment} style={referralsStyle} />

const referralsStyle = {
  ...appointmentStyle,
  padding: 12,
  paddingBottom: 0
}
