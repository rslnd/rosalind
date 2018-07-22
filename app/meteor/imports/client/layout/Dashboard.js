import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { withTracker } from 'meteor/react-meteor-data'
import { CalendarSelect } from '../calendars/CalendarSelect'
import { Waitlist } from '../appointments/waitlist'

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
  const canSeeWaitlist = Roles.userIsInRole(Meteor.userId(), ['admin', 'waitlist'])
  const canSeeAppointments = Roles.userIsInRole(Meteor.userId(), ['admin', 'appointments'])

  return {
    canSeeWaitlist,
    canSeeAppointments: false,
    ...props
  }
}

export const Dashboard = withTracker(composer)(DashboardComponent)
