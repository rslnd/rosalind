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

  const existingReferrals = referrable => referrals.filter(r => (r.referrableId === referrable._id))
  const existingAppointment = referrable => appointments.find(a =>
    (a.calendarId === referrable.toCalendarId) ||
    (a.tags && a.tags.includes(referrable.toTagId))
  )
  const isReferrable = referrable =>
    (existingReferrals(referrable).length < (referrable.max || Number.MAX_SAFE_INTEGER)) &&
    (!existingAppointment(referrable))

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

  const userId = Meteor.userId()
  const referrables = Referrables.find({ fromCalendarIds: calendarId },
    { sort: { order: 1 } }).fetch().map(referrable => {
      const existing = existingReferrals(referrable)
      return {
        ...referrable,
        existingReferrals: existing,
        existingReferralsBySameAssignee: existing && existing.filter(e => e.referredBy === userId),
        isReferrable: isReferrable(referrable),
        handleClick: handleClick(referrable)
      }
    })

  return {
    ...props,
    referrables
  }
}

export const ReferralsContainer = withTracker(composer)(ReferralsWidget)
