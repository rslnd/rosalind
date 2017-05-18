import mapValues from 'lodash/fp/mapValues'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'

const mapAppointments = ({ assigneeId, appointments, hours, tagMapping }) => {
  // Group by first tag
  // TOOD: Check if the first tag is also the one with the highest priority
  const applyTagMapping = (appointment) => {
    if (appointment.tags && appointment.tags[0]) {
      return tagMapping[appointment.tags[0]] || null
    } else {
      return null
    }
  }

  const appointmentsByTags = groupBy(applyTagMapping)(appointments)

  const byTags = mapValues((appointments) => {
    const planned = appointments.length

    return {
      planned
    }
  })(appointmentsByTags)

  const planned = appointments.length

  return {
    total: {
      planned
    },
    ...byTags
  }
}

const mapAssignee = ({ assigneeId, appointments, overrideSchedules, tagMapping }) => {
  const patients = mapAppointments({ assigneeId, appointments, tagMapping })

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
    }

    return assignee
  }))

  return assignees
}
