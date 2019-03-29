import React from 'react'
import { namecase } from '../../../util/namecase'
import Paper from '@material-ui/core/Paper'
import { prefix } from '../../../api/patients/methods/name'
import { flex } from '../../components/form/rowStyle'
import { ReferralsContainer } from '../../referrals/ReferralsContainer'
import { ActionButton } from './ActionButton'
import { ErrorBoundary } from '../../layout/ErrorBoundary'
import { History } from './History'

const boxStyle = {
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

export const WaitlistItem = ({
  appointment,
  isFirst,
  isLast,
  action,
  handleChangeWaitlistAssignee,
  canChangeWaitlistAssignee,
  history
}) =>
  <Paper style={isFirst ? boxStyleFirst : boxStyle}>
    <div style={flex}>
      <div style={patientInfoStyle}>
        {
          appointment.patient
            ? <div>
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
            : <div>{appointment.note}</div>
        }
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
        isLast={isLast}
        handleChangeWaitlistAssignee={handleChangeWaitlistAssignee}
        canChangeWaitlistAssignee={canChangeWaitlistAssignee} />
    </div>
    {
      history && appointment.treatmentStart && !appointment.treatmentEnd &&
        <ErrorBoundary>
          <History appointment={appointment} patient={appointment.patient} />
        </ErrorBoundary>
    }
  </Paper>
