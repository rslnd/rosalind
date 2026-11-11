import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Navigate } from 'react-router-dom'
import { withTracker } from '../components/withTracker'
import { CalendarSelect } from '../calendars/CalendarSelect'
import { Waitlist } from '../appointments/waitlist'
import { Calendars } from '../../api/calendars'
import { hasRole } from '../../util/meteor/hasRole'

const DashboardComponent = ({ canSeeWaitlist, canSeeCalendars, firstCalendar, ...props }) => {
  if (!canSeeCalendars && canSeeWaitlist) {
    return <Waitlist {...props} />
  }

  if (firstCalendar) {
    return <Navigate replace to={`/appointments/${firstCalendar.slug}`} />
  }

  if (canSeeCalendars) {
    return <CalendarSelect {...props} />
  }

  return <div />
}

const composer = props => {
  const canSeeWaitlist = hasRole(Meteor.userId(), ['waitlist'])
  const canSeeCalendars = hasRole(Meteor.userId(), [`calendar-*`])
  const canSeeCalendar = c => hasRole(Meteor.userId(), [`calendar-${c.slug}`])

  const firstCalendar = canSeeCalendars
    ? Calendars.find({}, { sort: { order: 1 } }).fetch().find(canSeeCalendar)
    : null

  return {
    canSeeWaitlist,
    canSeeCalendars,
    canSeeCalendar,
    firstCalendar,
    ...props
  }
}

export const Dashboard = withTracker(composer)(DashboardComponent)
