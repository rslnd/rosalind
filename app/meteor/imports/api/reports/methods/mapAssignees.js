import mapValues from 'lodash/fp/mapValues'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import uniqBy from 'lodash/fp/uniqBy'

const mapAppointments = (appointments) => {
  const planned = uniqBy('patientId')(appointments
    .filter(a => a.patientId && a.removed !== true))
  const canceled = planned.filter(a => a.canceled).length
  const admitted = planned.filter(a => a.admittedAt).length
  const noShow = planned.length - canceled - admitted

  return {
    planned: planned.length,
    canceled,
    admitted,
    noShow
  }
}

export const mapAppointmentsByTags = ({ appointments, tagMapping }) => {
  // Group by first tag
  // TODO: Check if the first tag is also the one with the highest priority
  const applyTagMapping = (appointment) => {
    if (appointment.tags && appointment.tags[0]) {
      return tagMapping[appointment.tags[0]] || null
    } else {
      return null
    }
  }

  const appointmentsByTags = groupBy(applyTagMapping)(appointments)
  const byTags = mapValues(mapAppointments)(appointmentsByTags)

  return {
    total: mapAppointments(appointments),
    ...byTags
  }
}

const mapAssignee = ({ assigneeId, appointments, overrideSchedules, tagMapping }) => {
  const patients = mapAppointmentsByTags({ appointments, tagMapping })

  return {
    assigneeId,
    patients
  }
}

export const mapAssignees = ({ appointments, overrideSchedules, tagMapping }) => {
  const appointmentsByAssignees = groupBy('assigneeId')(appointments)

  // Group unassigned appointments under 'null' and remove assigneeId field
  if (appointmentsByAssignees['undefined']) {
    appointmentsByAssignees.null = appointmentsByAssignees['undefined']
    delete appointmentsByAssignees['undefined']
  }

  const overrideSchedulesByAssignees = groupBy('userId')(overrideSchedules)

  const assignees = sortBy('assigneeId')(Object.keys(appointmentsByAssignees).map((assigneeId) => {
    const appointments = appointmentsByAssignees[assigneeId]
    const overrideSchedules = overrideSchedulesByAssignees[assigneeId]

    const assignee = mapAssignee({
      assigneeId,
      appointments,
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
