import React from 'react'
import identity from 'lodash/identity'
import Button from 'material-ui/Button'
import FlipMove from 'react-flip-move'
import namecase from 'namecase'
import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { Appointments } from '../../../api/appointments'
import { Box } from '../../components/Box'

export const WaitlistScreen = ({ appointments }) => (
  <FlipMove style={containerStyle}>
    {
      appointments.map((appointment, i) => (
        <div key={appointment._id}>
          <WaitlistItem
            isFirst={i === 0}
            appointment={appointment} />
        </div>
      ))
    }
  </FlipMove>
)

const containerStyle = {
  padding: 6,
  overflow: 'hidden',
  maxHeight: 'calc(100vh - 100px)'
}

const boxStyle = {
  fontSize: 18,
  padding: 6,
  marginBottom: 10
}

const WaitlistItem = ({ appointment, isFirst }) =>
  <Box noPadding boxStyle={boxStyle}>
    <div>
      <span className='text-muted'>
        {appointment.patient.prefix()}
        {
          appointment.patient.profile.titlePrepend &&
            <span>
              {appointment.patient.profile.titlePrepend}
              &ensp;
            </span>
        }
      </span>
      <b>{namecase(appointment.patient.profile.lastName)}</b>&ensp;
      {namecase(appointment.patient.profile.firstName)}&ensp;
      <span className='text-muted'>
        {appointment.patient.profile.titleAppend}
      </span>
    </div>

    <ActionButton
      appointment={appointment}
      highlight={isFirst} />
  </Box>

const action = (action, appointment) => {
  const fn = () => Appointments.actions[action].callPromise({ appointmentId: appointment._id })
    .then(() => {
      Alert.success(TAPi18n.__(`appointments.${action}Success`))
    })
    .catch((e) => {
      console.error(e)
      Alert.error(TAPi18n.__(`appointments.error`))
    })
  const title = TAPi18n.__(`appointments.${action}`)
  return { title, fn }
}

const ActionButton = ({ appointment, highlight }) => {
  const a = appointment
  const nextAction = [
    !a.treatmentStart && action('startTreatment', a),
    a.treatmentStart && !a.treatmentEnd && action('endTreatment', a)
  ].find(identity)

  return nextAction && <Button
    variant='raised'
    color={highlight ? 'primary' : 'default'}
    size='large'
    onClick={nextAction.fn}
    fullWidth>
    {
      nextAction.title
    }
  </Button> || null
}
