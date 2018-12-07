import React from 'react'
import moment from 'moment-timezone'
import { __ } from '../../../i18n'
import { ListItem } from './ListItem'
import { Users } from '../../../api/users'

export const Day = ({ appointment }) => (
  <ListItem icon='calendar' hr>
    {moment(appointment.start).format(__('time.dateFormatWeekday'))}
  </ListItem>
)

export const Time = ({ appointment }) => (
  <ListItem icon='clock-o' hr>
    {moment(appointment.start).format(__('time.timeFormatShort'))}
    &nbsp;-&nbsp;
    {moment(appointment.end).format(__('time.timeFormat'))}
  </ListItem>
)

export const Assignee = ({ assignee }) => (
  assignee && <ListItem icon='user-md' hr>
    {Users.methods.fullNameWithTitle(assignee)}
  </ListItem> || null
)
