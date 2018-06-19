import uniq from 'lodash/uniq'
import mapValues from 'lodash/fp/mapValues'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import uniqBy from 'lodash/fp/uniqBy'
import sum from 'lodash/fp/sum'
import identity from 'lodash/fp/identity'
import { isNew } from './mapPlannedNew'

const uniqAppointments = appointments => uniqBy('patientId')(appointments
  .filter(a => a.patientId && a.removed !== true))

const mapAppointments = (patients) => {
  const planned = patients.length
  const canceled = patients.filter(a => a.canceled).length
  const expected = planned - canceled
  const admitted = patients.filter(a => a.admittedAt).length
  const noShow = expected - admitted

  return {
    planned,
    canceled,
    expected,
    admitted,
    noShow
  }
}

export const mapAppointmentsByTags = ({ appointments, pastAppointments, tagMapping }) => {
  // Group by first tag
  // TODO: Check if the first tag is also the one with the highest priority
  const applyTagMapping = (appointment) => {
    if (appointment.tags && appointment.tags[0]) {
      return tagMapping[appointment.tags[0]] || null
    } else {
      return null
    }
  }

  const uniqueAppointments = uniqAppointments(appointments)
  const appointmentsByTags = groupBy(applyTagMapping)(uniqueAppointments)
  const byTags = mapValues(mapAppointments)(appointmentsByTags)
  const newAppointments = uniqueAppointments.filter(isNew(pastAppointments))
  const recallAppointments = uniqueAppointments.filter(a => !isNew(pastAppointments)(a))

  return {
    ...byTags,
    total: mapAppointments(uniqueAppointments),
    new: mapAppointments(newAppointments),
    recall: mapAppointments(recallAppointments)
  }
}

const mapRevenue = ({ appointments }) => {
  const calculate = filter => sum(appointments
    .filter(a => !a.canceled && !a.removed)
    .filter(filter)
    .map(a => a.revenue)
    .filter(identity))

  const planned = calculate(identity)
  const expected = calculate(a => a.admitted)

  const revenues = {
    planned,
    expected
  }

  return {
    private: revenues,
    total: revenues
  }
}

const mapAssignee = ({ assigneeId, appointments = [], pastAppointments = [], overrideSchedules = [], tagMapping }) => {
  const patients = mapAppointmentsByTags({ appointments, pastAppointments, tagMapping })

  const revenue = mapRevenue({ appointments })

  return {
    assigneeId,
    patients,
    revenue
  }
}

export const mapAssignees = ({ appointments, pastAppointments, overrideSchedules, tagMapping }) => {
  const appointmentsByAssignees = groupBy('assigneeId')(appointments)

  // Group unassigned appointments under 'null' and remove assigneeId field
  if (appointmentsByAssignees['undefined']) {
    appointmentsByAssignees.null = appointmentsByAssignees['undefined']
    delete appointmentsByAssignees['undefined']
  }

  const overrideSchedulesByAssignees = groupBy('userId')(overrideSchedules)

  const assigneeIds = uniq([
    ...Object.keys(overrideSchedulesByAssignees),
    ...Object.keys(appointmentsByAssignees)
  ])

  const assignees = sortBy('assigneeId')(assigneeIds.map((assigneeId) => {
    const appointments = appointmentsByAssignees[assigneeId]
    const overrideSchedules = overrideSchedulesByAssignees[assigneeId]

    const assignee = mapAssignee({
      assigneeId,
      appointments,
      pastAppointments,
      overrideSchedules,
      tagMapping
    })

    if (assignee.assigneeId === 'null') {
      delete assignee.assigneeId
      assignee.type = 'overbooking'
    }

    return assignee
  }))

  return assignees
}
