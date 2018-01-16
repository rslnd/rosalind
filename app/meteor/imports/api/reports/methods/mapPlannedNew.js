import moment from 'moment'
import identity from 'lodash/identity'
import find from 'lodash/fp/find'
import { quarter } from '../../../util/time/quarter'

export const isNew = pastAppointments => appointment => {
  return !find(p => p.patientId === appointment.patientId)(pastAppointments)
}

export const pastAppointmentsSelector = ({ calendarId, appointments }) => {
  const date = appointments[0].start
  const startOfDay = moment(date).startOf('day').toDate()
  const startOfQuarter = quarter(date).range.start.toDate()
  const patientIds = appointments.map(a => a.patientId).filter(identity)

  return {
    calendarId,
    patientId: { $in: patientIds },
    admittedAt: { $ne: null },
    start: {
      $gt: startOfQuarter,
      $lt: startOfDay
    }
  }
}
