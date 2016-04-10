import users from '/imports/api/users/server'
import groups from '/imports/api/groups/server'
import patients from '/imports/api/patients/server'
import appointments from '/imports/api/appointments/server'
import cache from '/imports/api/cache/server'
import comments from '/imports/api/comments/server'
import customer from '/imports/api/customer/server'
import events from '/imports/api/events/server'
import importers from '/imports/api/importers/server'
import inboundCalls from '/imports/api/inboundCalls/server'
import jobs from '/imports/api/jobs/server'
import reports from '/imports/api/reports/server'
import roles from '/imports/api/roles/server'
import schedules from '/imports/api/schedules/server'
import search from '/imports/api/search/server'
import system from '/imports/api/system/server'
import tags from '/imports/api/tags/server'
import timesheets from '/imports/api/timesheets/server'

export default function() {
  users()
  groups()
  patients()
  appointments()
  cache()
  comments()
  customer()
  events()
  importers()
  inboundCalls()
  jobs()
  reports()
  roles()
  schedules()
  search()
  system()
  tags()
  timesheets()
}
