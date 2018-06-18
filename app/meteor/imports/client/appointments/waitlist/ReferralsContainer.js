import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { withTracker } from 'meteor/react-meteor-data'
import find from 'lodash/find'
import Alert from 'react-s-alert'
import { Referrals } from '../../../api/referrals'
import { Tags } from '../../../api/tags'
import { Calendars } from '../../../api/calendars'
import { Appointments } from '../../../api/appointments'
import { ReferralsWidget } from './ReferralsWidget'

const composer = props => {
  const { calendarId, patientId } = props.appointment

  if (!patientId) {
    return null
  }

  const referrals = Referrals.find({ patientId }).fetch()
  const appointments = Appointments.find({ patientId }).fetch()

  const existingReferral = toId => find(referrals, r => r.referredTo === toId)
  const existingAppointment = toId => find(appointments, a =>
    a.calendarId === toId ||
    a.tags && a.tags.includes(toId)
  )
  const isReferrable = toId =>
    !existingReferral(toId) &&
    !existingAppointment(toId)

  const handleClick = toId => () => {
    if (isReferrable(toId)) {
      Alert.success(TAPi18n.__('appointments.referralSuccess'))
      return Referrals.actions.insert.callPromise({
        patientId,
        referredTo: toId,
        appointmentId: props.appointment._id
      })
    }
  }

  const mapper = x => {
    const existing = existingReferral(x)
    return {
      ...x,
      existingReferral: existing,
      existingReferralBySameAssignee: existing && existing.referredBy === Meteor.userId(),
      isReferrable: isReferrable(x._id),
      handleClick: handleClick(x._id)
    }
  }

  const referrableTags = Tags.find({ referrableFrom: calendarId })
    .fetch().map(mapper)

  const referrableCalendars = Calendars.find({ referrableFrom: calendarId })
    .fetch().map(mapper)

  const length = [ ...referrableTags, ...referrableCalendars ].filter(x =>
    x.existingReferralBySameAssignee || isReferrable(x._id)
  ).length

  return {
    referrableTags,
    referrableCalendars,
    length
  }
}

export const ReferralsContainer = withTracker(composer)(ReferralsWidget)
