import settings from '../../api/settings/server'
import users from '../../api/users/server'
import groups from '../../api/groups/server'
import patients from '../../api/patients/server'
import calendars from '../../api/calendars/server'
import appointments from '../../api/appointments/server'
import customer from '../../api/customer/server'
import events from '../../api/events/server'
import inboundCalls from '../../api/inboundCalls/server'
import messages from '../../api/messages/server'
import referrals from '../../api/referrals/server'
import reports from '../../api/reports/server'
import schedules from '../../api/schedules/server'
import tags from '../../api/tags/server'
import timesheets from '../../api/timesheets/server'
import clients from '../../api/clients/server'
import constraints from '../../api/constraints/server'
import availabilities from '../../api/availabilities/server'
import media from '../../api/media/server'
import records from '../../api/records/server'
import templates from '../../api/templates/server'
import consents from '../../api/consents/server'
import checkups from '../../api/checkups/server'

export default function () {
  settings()
  users()
  groups()
  patients()
  calendars()
  appointments()
  customer()
  events()
  inboundCalls()
  messages()
  referrals()
  reports()
  schedules()
  tags()
  timesheets()
  clients()
  constraints()
  availabilities()
  media()
  records()
  templates()
  consents()
  checkups()
}
