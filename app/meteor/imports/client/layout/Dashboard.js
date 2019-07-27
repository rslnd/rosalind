import React from 'react'
import { Meteor } from 'meteor/meteor'
import { withTracker } from '../components/withTracker'
import { CalendarSelect } from '../calendars/CalendarSelect'
import { Waitlist } from '../appointments/waitlist'
import { hasRole } from '../../util/meteor/hasRole'

const DashboardComponent = ({ canSeeWaitlist, canSeeAppointments, ...props }) => {
  if (!canSeeAppointments && canSeeWaitlist) {
    return <Waitlist {...props} />
  }

  if (canSeeAppointments) {
    return <CalendarSelect {...props} />
  }

  return <div />
}

const composer = props => {
  const canSeeWaitlist = hasRole(Meteor.userId(), ['admin', 'waitlist'])
  const canSeeAppointments = hasRole(Meteor.userId(), ['admin', 'appointments-*'])

  return {
    canSeeWaitlist,
    canSeeAppointments,
    ...props
  }
}

export const Dashboard = withTracker(composer)(DashboardComponent)
