import RRule from 'rrule'
import moment from 'moment-timezone'

export const getDue = ({ Checkups, CheckupsRules }) =>
  ({ date }) => {
    const d = moment(date).toDate()

    return CheckupsRules.find({}).fetch().filter(ru => {
        return moment(
            RRule.fromString(ru.rrule)
            .after(d, true))
        .isSame(d, 'day')
    })
  }
