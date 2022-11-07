import moment from 'moment-timezone'
import identity from 'lodash/identity'
import find from 'lodash/fp/find'
import { quarter } from '../../../util/time/quarter'

export const isNew = pastAppointments => appointment => {
  return !find(p => p.patientId === appointment.patientId)(pastAppointments)
}

export const pastAppointmentsSelector = ({ date, calendarId, appointments, hiddenAssigneeIds }) => {
  if (!appointments || appointments.length === 0) {
    return {
      thisSelectorShouldNotFindAnything: true
    }
  }

  const startOfDay = moment(date).clone().startOf('day').toDate()
  const startOfQuarter = quarter(date).range.start.toDate()
  const patientIds = appointments.map(a => a.patientId).filter(identity)

  return {
    calendarId,
    assigneeId: { $nin: hiddenAssigneeIds },
    patientId: { $in: patientIds },
    admittedAt: { $ne: null },
    start: {
      $gt: startOfQuarter,
      $lt: startOfDay
    }
  }
}
