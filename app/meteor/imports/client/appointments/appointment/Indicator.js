import React from 'react'
import { __ } from '../../../i18n'
import { Icon } from '../../components/Icon'
import { green, red } from '../../layout/styles'
import { Currency } from '../../components/Currency'

const assumeNoShowAfterMinutes = 90

export const Indicator = ({ appointment, showRevenue, calendar }) => {
  if (!appointment.patientId || appointment.canceled || appointment.removed) {
    return null
  }

  if (appointment.treated || (calendar && calendar.admittedIsTreated && appointment.admitted)) {
    return <Treated />
  }

  if (appointment.admitted) {
    return <Admitted />
  }

  const assumeNoShow = ((new Date() - appointment.end) / 1000 / 60) >= assumeNoShowAfterMinutes
  if (assumeNoShow) {
    return <NoShow />
  }

  return null
}

const Admitted = () => <span
  key='admitted'
  className='pull-right'
  title={__('appointments.admitted')}
  style={admittedStyle}>
  <Icon name='angle-right' />&nbsp;
</span>

const admittedStyle = {
  display: 'inline-block',
  color: green
}

const Treated = () => <span
  key='treated'
  className='pull-right'
  title={__('appointments.treated')}
  style={treatedStyle}>
  <Icon name='check' />&nbsp;
</span>

const treatedStyle = {
  display: 'inline-block',
  color: green
}

const NoShow = () => <span
  key='noShow'
  className='pull-right'
  title={__('appointments.noShow')}
  style={noShowStyle}>
  <Icon name='times' />&nbsp;
</span>

const noShowStyle = {
  display: 'inline-block',
  color: red
}

export const Revenue = ({ appointment }) =>
  <span>
    {
      (appointment.revenue === 0 || appointment.revenue > 0) &&
        <span>
          <Currency value={appointment.revenue} />&nbsp;
        </span>
    }
  </span>
