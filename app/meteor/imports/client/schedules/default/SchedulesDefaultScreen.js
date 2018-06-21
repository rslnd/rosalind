import React from 'react'
import { Calendars } from '../../../api/calendars'
import { Schedules } from '../../../api/schedules'
import { Users } from '../../../api/users'
import { Box } from '../../components/Box'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { withTracker } from 'meteor/react-meteor-data'
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow
} from '../../components/Table'

const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const renderTime = s => {
  if (!s) return null
  return `${s.h}:${s.m}`
}

const composer = props => {
  const { slug } = props.match.params
  const calendar = Calendars.findOne({ slug })
  const users = Users.find({}).fetch()

  Meteor.subscribe('schedules-default', {})

  const defaultSchedules = Schedules.find({
    type: 'default',
    calendarId: calendar._id,
    removed: { $ne: true }
  }).fetch()

  return {
    calendar,
    users,
    defaultSchedules
  }
}

class SchedulesDefaultScreenComponent extends React.Component {
  constructor (props) {
    super(props)

    this.assignees = this.assignees.bind(this)
    this.renderSchedules = this.renderSchedules.bind(this)
  }

  assignees () {
    return this.props.defaultSchedules.map(a =>
      this.props.users.find(u => u._id === a.assigneeId)
    )
  }

  renderSchedules ({ weekday, assigneeId }) {
    const schedules = this.props.defaultSchedules.filter(s =>
      s.assigneeId === assigneeId &&
      s.weekday === weekday
    )

    return schedules.map(s =>
      <div key={s._id}>
        {renderTime(s.from)}-{renderTime(s.to)}
      </div>
    )
  }

  render () {
    const {
      calendar,
      defaultSchedules
    } = this.props

    return (
      <div>
        <div className='content-header'>
          <h1>Arbeitszeiten festlegen für <b>{calendar.name}</b></h1>
        </div>
        <div className='content'>
          <Box title='Standardwoche planen' icon='calendar-o' noPadding>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{/* */}</TableCell>
                  {
                    weekdays.map(weekday =>
                      <TableCell key={weekday}>
                        {TAPi18n.__(`time.${weekday}`)}
                      </TableCell>
                    )
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  this.assignees().map(assignee =>
                    <TableRow key={assignee._id}>
                      <TableCell>
                        {Users.methods.fullNameWithTitle(assignee)}
                      </TableCell>
                      {
                        weekdays.map(weekday =>
                          <TableCell key={weekday}>{
                            this.renderSchedules({
                              assigneeId: assignee._id,
                              weekday
                            })
                          }</TableCell>
                        )
                      }
                    </TableRow>
                  )
                }

                <TableRow>
                  <TableCell>
                    + Add assignee
                  </TableCell>
                </TableRow>

              </TableBody>
            </Table>
          </Box>

          <Box title='Wochenplan anwenden' icon='magic'>
            Do the Magic
          </Box>

        </div>
      </div>
    )
  }
}

export const SchedulesDefaultScreen = withTracker(composer)(SchedulesDefaultScreenComponent)
