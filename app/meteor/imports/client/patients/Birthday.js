import React from 'react'
import moment from 'moment-timezone'
import { __ } from '../../i18n'
import { dayToDate } from '../../util/time/day'

export const Birthday = ({ day, veryShort }) => {
  if (day) {
    const birthday = dayToDate(day)
    const formatted = moment(birthday).format(__(veryShort ? 'time.dateFormatVeryShort' : 'time.dateFormatShort'))
    const age = moment().diff(birthday, 'years')

    return (
      <span>{formatted} ({__('patients.yearsOld', { age })})</span>
    )
  } else {
    return null
  }
}
