import { Users } from './users'
import { Groups } from './groups'
import { Schedules } from './schedules'
import { Timesheets } from './timesheets'
import { Comments } from './comments'
import { Tags } from './tags'
import { Events } from './events'
import { Customer } from './customer'
import { Patients } from './patients'
import { InboundCalls, InboundCallsTopics } from './inboundCalls'
import { Calendars } from './calendars'
import { Appointments } from './appointments'
import { Importers } from './importers'
import { Messages } from './messages'
import { Referrals, Referrables } from './referrals'
import { Reports } from './reports'
import { Search } from './search'
import { Settings } from './settings'
import { Clients } from './clients'
import { Constraints } from './constraints'
import { Availabilities } from './availabilities'
import { Media, MediaTags } from './media'
import { Records } from './records'
import { Templates } from './templates'
import { Consents } from './consents'
import day, { dateToDay } from '../util/time/day'
import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'

const callAsync = (method, args) =>
  new Promise((resolve, reject) => {
    Meteor.call(method, args, (err, ok) => {
      if (err) {
        reject(err)
      } else {
        resolve(ok)
      }
    })
  })

const generateReports = async (start, end) => {
  const range = moment.range(moment(start), moment(end))
  const days = Array.from(range.by('days')).map(t => moment(t))

  for (let d of days) {
    console.log('Generating report for', d.toString())
    await callAsync('reports/generate', { day: dateToDay(d) })
  }

  console.log('Done generating reports for', days.length, 'days')
}


export {
  Users,
  Groups,
  Patients,
  Calendars,
  Appointments,
  Comments,
  Customer,
  Events,
  Importers,
  InboundCalls,
  InboundCallsTopics,
  Messages,
  Referrals,
  Referrables,
  Reports,
  Schedules,
  Search,
  Settings,
  Tags,
  Timesheets,
  Clients,
  Constraints,
  Availabilities,
  Media,
  MediaTags,
  Records,
  Templates,
  Consents,
  day,
  moment,
  Meteor,
  generateReports
}
