import React from 'react'
import { __ } from '../../../i18n'
import { Icon } from '../../components/Icon'
import { green, red, warning, primaryActive } from '../../layout/styles'
import { Currency } from '../../components/Currency'

const assumeNoShowAfterMinutes = 60

const stateIndicatorStyle = {
  minWidth: 15,
  display: 'inline-block'
}

export const Indicator = (props) => {
  return <>
    <InsuranceIndicator {...props} />
    <div style={stateIndicatorStyle}>
      <StateIndicator {...props} />
    </div>
  </>
}

const InsuranceIndicator = ({ appointment, calendar }) => {
  if (!appointment || !appointment.patient || (typeof appointment.patient.isPrivateInsurance !== 'boolean')) {
    return null
  }

  if (appointment.patient.isPrivateInsurance) {
    return <small title={'Privat'} className='text-muted pt1'>P&nbsp;</small>
  } else {
    return null
  }
}

const StateIndicator = ({ appointment, showRevenue, calendar }) => {
  if (!appointment || !appointment.patientId || appointment.canceled || appointment.removed) {
    return null
  }

  if (appointment.treated || (calendar && calendar.admittedIsTreated && appointment.admitted)) {
    return <Treated />
  }

  if (appointment.treatmentStart) {
    return <Treating />
  }

  if (appointment.admitted) {
    return <Admitted />
  }

  if (appointment.dismissed) {
    return <Dismissed />
  }

  if (appointment.queued) {
    return <Queued />
  }

  if (appointment.noShow) {
    return <NoShow />
  }
  const assumeNoShow = ((new Date() - appointment.end) / 1000 / 60) >= assumeNoShowAfterMinutes
  if (assumeNoShow) {
    return <NoShow />
  }

  return null
}

const Queued = () => <div
  key='queued'
  title={__('appointments.queued')}
  style={queuedStyle}>
  <Icon name='circle' />&nbsp;
</div>

const queuedStyle = {
  // zoom: 0.6,
  color: warning
}

const Dismissed = () => <div
  key='dismissed'
  title={__('appointments.dismissed')}
  style={dismissedStyle}>
  <Icon name='circle-o' />&nbsp;
</div>

const dismissedStyle = {
  color: '#0000ff'
}


const Admitted = () => <div
  key='admitted'
  title={__('appointments.admitted')}
  style={admittedStyle}>
  <Icon name='angle-double-right' />&nbsp;
</div>

const admittedStyle = {
  color: green
}

const Treated = () => <div
  key='treated'
  title={__('appointments.treated')}
  style={treatedStyle}>
  <Icon name='check' />&nbsp;
</div>

const treatedStyle = {
  color: green
}

const Treating = () => <div
  key='treating'
  title={__('appointments.treating')}
  style={treatingStyle}>
  <Icon name='circle-o-notch' />&nbsp;
</div>

const treatingStyle = {
  color: primaryActive
}

const NoShow = () => <div
  key='noShow'
  title={__('appointments.noShow')}
  style={noShowStyle}>
  <Icon name='times' />&nbsp;
</div>

const noShowStyle = {
  color: red
}

export const Revenue = ({ appointment }) =>
  <div>
    {
      (appointment.revenue === 0 || appointment.revenue > 0) &&
        <span>
          <Currency value={appointment.revenue} />&nbsp;
        </span>
    }
  </div>
