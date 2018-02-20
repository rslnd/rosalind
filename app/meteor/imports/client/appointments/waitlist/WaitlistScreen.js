import React from 'react'
import identity from 'lodash/identity'
import Button from 'material-ui/Button'
import FlipMove from 'react-flip-move'
import namecase from 'namecase'
import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { Appointments } from '../../../api/appointments'
import { Box } from '../../components/Box'
import { Icon } from '../../components/Icon'

export const WaitlistScreen = ({ appointments }) => (
  <FlipMove style={containerStyle}>
    {
      appointments.map((appointment, i) => (
        <div key={appointment._id}>
          <WaitlistItem
            isFirst={i === 0}
            isLast={i === (appointments.length - 1)}
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

const WaitlistItem = ({ appointment, isFirst, isLast }) =>
  <Box noPadding boxStyle={boxStyle}>
    <div>
      <span className='text-muted'>
        {appointment.patient.prefix()}
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

    {
      appointment.treatmentStart &&
        <Referrals referrals={appointment.referrals} />
    }

    <ActionButton
      appointment={appointment}
      isFirst={isFirst}
      isLast={isLast} />
  </Box>

const Referrals = ({ referrals }) =>
  referrals.length >= 1 && <div style={{ paddingTop: 6, paddingBottom: 6 }}>
    {
      referrals.length >= 2 &&
        <small className='text-muted'>PatientIn zu<br /></small>
    }

    {
      referrals.referrableCalendars.map(r => (
        <Button
          key={r._id}>
          <div style={{ textAlign: 'center' }}>
            {
              referrals.length === 1 &&
                <small className='text-muted'>Patientin zu<br /></small>
            }
            <Icon name={r.icon} /><br />
            {r.name}
            {
              referrals.length === 1 &&
                <small className='text-muted'><br />empfehlen</small>
            }
          </div>
        </Button>
      ))
    }

    {
      referrals.referrableTags.map(r => (
        <Button
          key={r._id}>
          {r.tag}
        </Button>
      ))
    }

    {
      referrals.length >= 2 &&
        <small className='text-muted'><br />empfehlen</small>
    }

  </div> || null

const action = (action, appointment, options = {}) => {
  const fn = () => Appointments.actions[action].callPromise({ appointmentId: appointment._id })
    .then(() => {
      Alert.success(TAPi18n.__(`appointments.${action}Success`))
    })
    .catch((e) => {
      console.error(e)
      Alert.error(TAPi18n.__(`appointments.error`))
    })

  const title = options.alternative
    ? TAPi18n.__(`appointments.${action}Alternative`)
    : TAPi18n.__(`appointments.${action}`)

  return { title, fn }
}

const ActionButton = ({ appointment, isFirst, isLast }) => {
  const a = appointment
  const nextAction = [
    !a.treatmentStart && action('startTreatment', a),
    a.treatmentStart && !a.treatmentEnd && !isLast && {
      ...action('nextTreatment', a),
      alternativeAction: action('endTreatment', a, { alternative: true })
    },
    a.treatmentStart && !a.treatmentEnd && action('endTreatment', a)
  ].find(identity)

  return nextAction && <div className='text-center'>
    <Button
      variant='raised'
      color={isFirst ? 'primary' : 'default'}
      size='large'
      onClick={nextAction.fn}
      fullWidth>
      {
        nextAction.title
      }
    </Button>
    {
      nextAction.alternativeAction &&
        <Button
          size='small'
          onClick={nextAction.alternativeAction.fn}
          style={{ marginTop: 6 }}
          fullWidth>
          {nextAction.alternativeAction.title}
        </Button>
    }
  </div> || null
}
