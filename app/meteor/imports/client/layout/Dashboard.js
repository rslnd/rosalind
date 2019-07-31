import React from 'react'
import { Meteor } from 'meteor/meteor'
import { withTracker } from '../components/withTracker'
import { CalendarSelect } from '../calendars/CalendarSelect'
import { Waitlist } from '../appointments/waitlist'
import { hasRole } from '../../util/meteor/hasRole'

const DashboardComponent = ({ canSeeWaitlist, canSeeCalendars, ...props }) => {
  if (!canSeeCalendars && canSeeWaitlist) {
    return <Waitlist {...props} />
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

  return {
    canSeeWaitlist,
    canSeeCalendars,
    canSeeCalendar,
    ...props
  }
}

export const Dashboard = withTracker(composer)(DashboardComponent)
