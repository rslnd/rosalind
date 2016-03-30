import appointments from '/imports/api/appointments/server'
import comments from '/imports/api/comments/server'
import events from '/imports/api/events/server'
import groups from '/imports/api/groups/server'
import inboundCalls from '/imports/api/inboundCalls/server'
import patients from '/imports/api/patients/server'
import reports from '/imports/api/reports/server'
import roles from '/imports/api/roles/server'
import schedules from '/imports/api/schedules/server'
import tags from '/imports/api/tags/server'
import timesheets from '/imports/api/timesheets/server'
import users from '/imports/api/users/server'

export default function() {
  appointments()
  comments()
  events()
  groups()
  inboundCalls()
  patients()
  reports()
  roles()
  schedules()
  tags()
  timesheets()
  users()
}
