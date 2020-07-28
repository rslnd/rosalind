import React from 'react'
import { Calendars } from '../../api/calendars'
import { DocumentPicker } from '../components/DocumentPicker'
import { withProps } from 'recompose'
import { Icon } from '../components/Icon'

export const CalendarPicker = withProps({
  toDocument: _id => Calendars.findOne({ _id }),
  toLabel: calendar => calendar.name,
  render: calendar => <span>
    <Icon name={calendar.icon} />&emsp;
    {calendar.name}
  </span>,
  options: () => {
    return Calendars.find({}, {
      sort: { order: 1 }
    }).fetch()
  }
})(DocumentPicker)
