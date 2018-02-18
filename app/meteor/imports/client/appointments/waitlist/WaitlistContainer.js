import moment from 'moment'
import identity from 'lodash/identity'
import some from 'lodash/fp/some'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Meteor } from 'meteor/meteor'
import { Appointments } from '../../../api/appointments'
import { Patients } from '../../../api/patients'
import { Referrals } from '../../../api/referrals'
import { Tags } from '../../../api/tags'
import { Calendars } from '../../../api/calendars'
import { WaitlistScreen } from './WaitlistScreen'

const composer = (props, onData) => {
  const startOfToday = moment().startOf('day').toDate()
  const endOfToday = moment().endOf('day').toDate()

  Meteor.subscribe('appointments', {
    start: startOfToday,
    end: endOfToday
  })

  const selector = {
    assigneeId: Meteor.userId(),
    admittedAt: { $ne: null },
    treatmentEnd: null,
    start: {
      $gt: startOfToday,
      $lt: endOfToday
    }
  }

  const appointments = Appointments.find(selector, {
    sort: { admittedAt: 1 }
  }).fetch()

  Meteor.subscribe('referrals', {
    patientIds: appointments.map(a => a.patientId).filter(identity)
  })

  const waitlistAppointments = appointments.map(appointment => {
    const { calendarId } = appointment
    const patient = Patients.findOne({ _id: appointment.patientId })
    const referrals = patient
      ? Referrals.find({ patientId: patient._id }).fetch()
      : []

    const isReferrable = x => !referrals.includes(r => r.referredTo === x._id)
    const referrableTags = Tags.find({ referrableFrom: calendarId }).fetch()
      .map(x => ({ ...x, isReferrable: isReferrable(x) }))

    const referrableCalendars = Calendars.find({ referrableFrom: calendarId }).fetch()
      .map(x => ({ ...x, isReferrable: isReferrable(x) }))

    const length = [ ...referrableTags, ...referrableCalendars ].filter(isReferrable).length

    return {
      ...appointment,
      patient,
      referrals: {
        referrableTags,
        referrableCalendars,
        length,
        insert: () => {}
      }
    }
  })

  onData(null, { ...props, appointments: waitlistAppointments })
}

export const WaitlistContainer = composeWithTracker(composer)(WaitlistScreen)
