import React from 'react'
import namecase from 'namecase'
import Paper from 'material-ui/Paper'
import { prefix } from '../../../api/patients/methods/name'
import { ReferralsContainer } from './ReferralsContainer'
import { ActionButton } from './ActionButton'

const boxStyle = {
  display: 'flex',
  padding: 12,
  marginBottom: 16
}

const boxStyleFirst = {
  ...boxStyle,
  marginBottom: 32
}

const patientInfoStyle = {
  flex: 1,
  fontSize: 18
}

const referralStyle = {
  flex: 1
}

const actionButtonStyle = {
  flex: 1
}

export const WaitlistItem = ({ appointment, isFirst, isLast, action }) =>
  <Paper style={isFirst ? boxStyleFirst : boxStyle}>
    <div style={patientInfoStyle}>
      <div>
        <span className='text-muted'>
          {prefix(appointment.patient)}&nbsp;
          {
            appointment.patient.titlePrepend &&
              <span>
                {appointment.patient.titlePrepend}
                &ensp;
              </span>
          }
        </span>
        <b>{namecase(appointment.patient.lastName)}</b>&ensp;
        {namecase(appointment.patient.firstName)}&ensp;
        <span className='text-muted'>
          {appointment.patient.titleAppend}
        </span>
      </div>
    </div>

    <div style={referralStyle}>
      {
        appointment.treatmentStart &&
          <ReferralsContainer appointment={appointment} />
      }
    </div>

    <ActionButton
      style={actionButtonStyle}
      action={action}
      appointment={appointment}
      isFirst={isFirst}
      isLast={isLast} />
  </Paper>
