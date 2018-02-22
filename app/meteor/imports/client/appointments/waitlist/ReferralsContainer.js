import { withTracker } from 'meteor/react-meteor-data'
import { Referrals } from '../../../api/referrals'
import { Tags } from '../../../api/tags'
import { Calendars } from '../../../api/calendars'
import { ReferralsWidget } from './ReferralsWidget'

const composer = props => {
  const { calendarId, patientId } = props.appointment

  const referrals = patientId
    ? Referrals.find({ patientId }).fetch()
    : []

  const isReferrable = x => !referrals.includes(r => r.referredTo === x._id)
  const referrableTags = Tags.find({ referrableFrom: calendarId }).fetch()
    .map(x => ({ ...x, isReferrable: isReferrable(x) }))

  const referrableCalendars = Calendars.find({ referrableFrom: calendarId }).fetch()
    .map(x => ({ ...x, isReferrable: isReferrable(x) }))

  const length = [ ...referrableTags, ...referrableCalendars ].filter(isReferrable).length

  return {
    referrableTags,
    referrableCalendars,
    length,
    insert: () => {}
  }
}

export const ReferralsContainer = withTracker(composer)(ReferralsWidget)
