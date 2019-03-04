import React from 'react'
import Alert from 'react-s-alert'
import uniqBy from 'lodash/fp/uniqBy'
import moment from 'moment-timezone'
import { withTracker } from '../../components/withTracker'
import { compose, withHandlers, withState, mapProps } from 'recompose'
import { __ } from '../../../i18n'
import { ListItem } from './ListItem'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import { Icon } from '../../components/Icon'

import { Appointments } from '../../../api/appointments'
import { Tags } from '../../../api/tags'

const composer = props => {
  const { appointment } = props
  const previousAppointments = Appointments.find({
    calendarId: appointment.calendarId,
    patientId: appointment.patientId,
    admitted: true,
    consentedAt: { $ne: null },
    start: {
      $lt: appointment.start
    }
  }, {
    sort: {
      start: -1
    }
  }).fetch()

  const previousConsents = uniqBy(a => a.consentedAt.getTime())(previousAppointments)

  return {
    ...props,
    previousConsents,
    hasPreviousConsents: previousConsents.length >= 1
  }
}

export const ConsentComponent = ({
  appointment,
  calendar,
  showOnly = 'pending',
  isSelectingPreviousConsent,
  previousConsents,
  hasPreviousConsents,
  handleToggle,
  handleSelectConsent
}) => {
  if (!calendar.consentRequired) {
    return null
  }

  const { consentedAt } = appointment

  if ((showOnly === 'pending' && consentedAt) ||
    (showOnly === 'agreed' && !consentedAt)) {
    return null
  }

  return <ListItem
    icon='file-text-o'
    highlight={!consentedAt}
    onClick={handleToggle}
    style={{ marginTop: 10, paddingTop: 15 }}>

    <div className='pull-right' style={{
      position: 'relative',
      right: 5,
      top: -15
    }}>
      <Switch
        color='primary'
        disabled={isSelectingPreviousConsent}
        checked={!!(consentedAt || isSelectingPreviousConsent)}
      />
    </div>

    {
      isSelectingPreviousConsent
        ? [
          <Button
            key='new'
            style={buttonStyle}
            onClick={handleSelectConsent(null)}
            variant='outlined'
            size='small'
          >{__('appointments.newConsent')}</Button>,
          previousConsents.map(pc =>
            <Button
              key={pc._id}
              style={buttonStyle}
              variant='outlined'
              size='small'
              onClick={handleSelectConsent(pc.consentedAt)}
            >{__('appointments.usePreviousConsent', {
                date: formatDate(pc.consentedAt),
                tags: explainTags(pc.tags)
              })}
            </Button>
          )
        ]
        : consentedAt
          ? __('appointments.consented', {
            date: moment(consentedAt).format(__('time.dateFormatShort'))
          })
          : __('appointments.notConsented')
    }

    <br /><br />
  </ListItem>
}

const buttonStyle = {
  marginBottom: 4
}

const formatDate = d =>
  moment(d).format(__('time.dateFormatShort'))

const explainTags = (tags) =>
  Tags.methods.expand(tags).map(t => t.tag).join(', ')

const handleNewSuccess = () =>
  Alert.success(__('appointments.consentNewSuccess'))

const handlePreviousSuccess = () =>
  Alert.success(__('appointments.consentPreviousSuccess'))

const handleUnsetSuccess = () =>
  Alert.success(__('appointments.consentUnsetSuccess'))

const handleError = () =>
  Alert.error(__('ui.tryAgain'))

export const Consent = compose(
  mapProps(p => ({ ...p, hasConsent: p.appointment.consentedAt })),
  withState('isSelectingPreviousConsent', 'setSelectingConsent', false),
  withTracker(composer),
  withHandlers({
    handleToggle: props => e => {
      if (!props.hasConsent) {
        if (props.hasPreviousConsents) {
          props.setSelectingConsent(true)
        } else {
          Appointments.actions.setConsented.callPromise({ appointmentId: props.appointment._id })
            .then(handleNewSuccess)
            .catch(handleError)
        }
      } else {
        Appointments.actions.unsetConsented.callPromise({ appointmentId: props.appointment._id })
          .then(handleUnsetSuccess)
          .catch(handleError)
      }
    },
    handleSelectConsent: props => previousConsentDate => e => {
      Appointments.actions.setConsented.callPromise({
        appointmentId: props.appointment._id,
        consentedAt: previousConsentDate
      }).then(previousConsentDate ? handlePreviousSuccess : handleNewSuccess).catch(handleError)
    }
  })
)(ConsentComponent)

export const ConsentIndicator = ({ appointment }) =>
  appointment && appointment.admitted && appointment.consentedAt
    ? (
      <Tooltip
        interactive
        placement='left-start'
        title={__('appointments.consentedAt', { date: formatDate(appointment.consentedAt) })}
      >
        <span className='text-muted' style={iconStyle}>
          <Icon name='file-text-o' />
        </span>
      </Tooltip>
    ) : null

const iconStyle = {
  display: 'inline-block',
  marginRight: 4
}
