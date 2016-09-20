import moment from 'moment'
import { TAPi18n } from 'meteor/tap:i18n'
import { dayToDate } from 'util/time/day'

export const Birthday = ({ day }) => {
  if (day) {
    const birthday = dayToDate(day)
    const formatted = moment(birthday).format(TAPi18n.__('time.dateFormat'))
    const age = moment().diff(birthday, 'years')

    return (
      <span>{formatted} ({TAPi18n.__('patients.yearsOld', { age })})</span>
    )
  } else {
    return null
  }
}
