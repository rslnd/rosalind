import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { withTracker } from 'meteor/react-meteor-data'
import find from 'lodash/find'
import Alert from 'react-s-alert'
import { Referrals } from '../../../api/referrals'
import { Tags } from '../../../api/tags'
import { Calendars } from '../../../api/calendars'
import { ReferralsWidget } from './ReferralsWidget'

const composer = props => {
  const { calendarId, patientId } = props.appointment

  if (!patientId) {
    return null
  }

  const referrals = Referrals.find({ patientId }).fetch()

  const existingReferral = ({ _id }) => find(referrals, r => r.referredTo === _id)
  const isReferrable = ({ _id }) => !existingReferral({ _id })

  const handleClick = ({ _id }) => () => {
    if (isReferrable({ _id })) {
      Alert.success(TAPi18n.__('appointments.referralSuccess'))
      return Referrals.actions.insert.callPromise({
        patientId,
        referredTo: _id,
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
      isReferrable: isReferrable(x),
      handleClick: handleClick(x)
    }
  }

  const referrableTags = Tags.find({ referrableFrom: calendarId })
    .fetch().map(mapper)

  const referrableCalendars = Calendars.find({ referrableFrom: calendarId })
    .fetch().map(mapper)

  const length = [ ...referrableTags, ...referrableCalendars ].filter(x =>
    x.existingReferralBySameAssignee || isReferrable(x)
  ).length

  return {
    referrableTags,
    referrableCalendars,
    length
  }
}

export const ReferralsContainer = withTracker(composer)(ReferralsWidget)
