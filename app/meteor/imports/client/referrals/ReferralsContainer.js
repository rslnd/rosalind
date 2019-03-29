import { Meteor } from 'meteor/meteor'
import { __ } from '../../i18n'
import { withTracker } from '../components/withTracker'
import find from 'lodash/find'
import Alert from 'react-s-alert'
import { Referrals, Referrables } from '../../api/referrals'
import { Tags } from '../../api/tags'
import { Calendars } from '../../api/calendars'
import { Appointments } from '../../api/appointments'
import { ReferralsWidget } from './ReferralsWidget'

const composer = props => {
  const { calendarId, patientId } = props.appointment

  if (!patientId) {
    return null
  }

  const referrals = Referrals.find({ patientId }).fetch()
  const appointments = Appointments.find({ patientId }).fetch()

  const existingReferral = referrable => find(referrals, r => (r.referrableId === referrable._id))
  const existingAppointment = referrable => find(appointments, a =>
    (a.calendarId === referrable.toCalendarId) ||
    (a.tags && a.tags.includes(referrable.toTagId))
  )
  const isReferrable = r =>
    !existingReferral(r) &&
    !existingAppointment(r)

  const handleClick = referrable => () => {
    if (isReferrable(referrable)) {
      Alert.success(__('appointments.referralSuccess'))
      return Referrals.actions.insert.callPromise({
        patientId,
        referredTo: (referrable.toCalendarId || referrable.toTagId),
        referrableId: referrable._id,
        appointmentId: props.appointment._id
      })
    }
  }

  const referrables = Referrables.find({ fromCalendarIds: calendarId },
    { sort: { order: 1 } }).fetch().map(referrable => {
    const existing = existingReferral(referrable)
    return {
      ...referrable,
      existingReferral: existing,
      existingReferralBySameAssignee: existing && existing.referredBy === Meteor.userId(),
      isReferrable: isReferrable(referrable),
      handleClick: handleClick(referrable)
    }
  })

  const length = referrables.filter(referrable =>
    referrable.existingReferralBySameAssignee || isReferrable(referrable)
  ).length

  return {
    ...props,
    referrables,
    length
  }
}

export const ReferralsContainer = withTracker(composer)(ReferralsWidget)
