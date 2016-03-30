import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

import application from './application'
import appointments from './appointments'
import inboundCalls from './inboundCalls'
import reports from './reports'
import schedules from './schedules'
import system from './system'
import users from './users'

export default function() {
  application()
  appointments()
  inboundCalls()
  reports()
  schedules()
  system()
  users()
}
