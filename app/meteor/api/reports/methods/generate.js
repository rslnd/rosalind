import mapValues from 'lodash/fp/mapValues'
import groupBy from 'lodash/fp/groupBy'
import { calculateScheduledHours } from '../../schedules/methods/getScheduledHours'

const mapWorkload = ({ hours, appointments }) => {
  const available = hours.planned * 12
  const planned = appointments.length

  return {
    available,
    planned
  }
}

const mapHours = ({ assigneeId, overrideSchedules }) => {
  return {
    planned: calculateScheduledHours({ overrideSchedules })
  }
}

const mapAppointments = ({ assigneeId, appointments }) => {
  const appointmentsByTags = groupBy('tag')(appointments)

  const byTags = mapValues((appointments) => {
    return {
      planned: appointments.length
    }
  })(appointmentsByTags)

  return {
    total: {
      planned: appointments.length
    },
    ...byTags
  }
}

const mapAssignee = ({ assigneeId, appointments, overrideSchedules }) => {
  const patients = mapAppointments({ assigneeId, appointments })
  const hours = mapHours({ assigneeId, overrideSchedules })
  const workload = mapWorkload({ hours, appointments })

  return {
    assigneeId,
    patients,
    hours,
    workload
  }
}

const mapAssignees = ({ appointments, overrideSchedules }) => {
  const appointmentsByAssignees = groupBy('assigneeId')(appointments)
  const overrideSchedulesByAssignees = groupBy('assigneeId')(overrideSchedules)

  return Object.keys(appointmentsByAssignees).map((assigneeId) => {
    return mapAssignee({
      assigneeId,
      appointments: appointmentsByAssignees[assigneeId],
      overrideSchedules: overrideSchedulesByAssignees[assigneeId]
    })
  })
}

export const generate = ({ day, appointments, overrideSchedules }) => {
  const report = {}

  report.day = day
  report.assignees = mapAssignees({ appointments, overrideSchedules })
  report.total = {} // TODO

  return report
}
