import settings from '../../api/settings/server'
import users from '../../api/users/server'
import groups from '../../api/groups/server'
import patients from '../../api/patients/server'
import calendars from '../../api/calendars/server'
import appointments from '../../api/appointments/server'
import comments from '../../api/comments/server'
import customer from '../../api/customer/server'
import events from '../../api/events/server'
import inboundCalls from '../../api/inboundCalls/server'
import messages from '../../api/messages/server'
import referrals from '../../api/referrals/server'
import reports from '../../api/reports/server'
import roles from '../../api/roles/server'
import schedules from '../../api/schedules/server'
import tags from '../../api/tags/server'
import timesheets from '../../api/timesheets/server'
import clients from '../../api/clients/server'
import constraints from '../../api/constraints/server'
import availabilities from '../../api/availabilities/server'
import media from '../../api/media/server'
import records from '../../api/records/server'

export default function () {
  settings()
  users()
  groups()
  patients()
  calendars()
  appointments()
  comments()
  customer()
  events()
  inboundCalls()
  messages()
  referrals()
  reports()
  roles()
  schedules()
  tags()
  timesheets()
  clients()
  constraints()
  availabilities()
  media()
  records()
}
