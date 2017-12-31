import add from 'lodash/add'
import mapValues from 'lodash/fp/mapValues'
import groupBy from 'lodash/fp/groupBy'
import identity from 'lodash/identity'
import {
  calculateScheduledHours,
  calculateScheduledHoursAM,
  calculateScheduledHoursPM,
  isAM, isPM
} from '../../schedules/methods/getScheduledHours'

const mapAssigneeHours = ({ assigneeId, overrideSchedules }) => {
  const ofAssignee = groupBy('userId')(overrideSchedules)[assigneeId]
  return {
    planned: calculateScheduledHours({ overrideSchedules: ofAssignee }),
    am: {
      planned: calculateScheduledHoursAM({ overrideSchedules: ofAssignee })
    },
    pm: {
      planned: calculateScheduledHoursPM({ overrideSchedules: ofAssignee })
    }
  }
}

// calculatePerHours takes an object like this: `{ hours: { planned, actual }}`
// And returns a function that takes an object (`fields`) with any keys, usually
// the keys are [ 'planned', 'actual' ], which returns a new object with
// the passed-in fields, and the same fields, and the field names with
// the string 'perHour' appended, like so:
// { planned: 2, plannedPerHour: 1, actual: 1, actualPerHour: 0.5}
const calculatePerHour = ({ hours }) => {
  if (!hours) {
    return identity
  }

  return (fields) => {
    let newFields = { ...fields }

    Object.keys(fields).map((key) => {
      newFields = Object.assign(newFields, {
        [`${key}PerHour`]: fields[key] / (hours[key] || hours.actual || hours.planned)
      })
    })

    return newFields
  }
}

const mapPatients = ({ patients, hours }) => (
  mapValues(calculatePerHour({ hours }))(patients)
)

const mapRevenue = ({ revenue, hours }) => (
  mapValues(calculatePerHour({ hours }))(revenue)
)

const sumAppointments = ({ appointments, slotsPerHour, filter = identity }) =>
  (appointments
    .filter(filter)
    .map(a => a.end - a.start)
    .reduce(add, 0) / (1000 * 60 * 60)) * slotsPerHour

const calculateWorkload = ({ calendar, appointments, hours }) => {
  const slotsPerHour = Math.ceil(60 / ((calendar && calendar.slotSize) || 5))
  const available = hours.planned * slotsPerHour
  const planned = sumAppointments({
    filter: a => !a.canceled,
    appointments,
    slotsPerHour
  })

  const actual = sumAppointments({
    filter: a => !a.canceled && a.admitted,
    appointments,
    slotsPerHour
  })

  return {
    available,
    planned,
    actual
  }
}

const mapWorkload = ({ calendar, hours, appointments }) => {
  const am = appointments.filter(isAM)
  const pm = appointments.filter(isPM)

  return {
    ...calculateWorkload({ calendar, hours, appointments }),
    am: {
      ...calculateWorkload({ calendar, hours: hours.am, appointments: am }),
      count: am.length
    },
    pm: {
      ...calculateWorkload({ calendar, hours: hours.pm, appointments: pm }),
      count: pm.length
    }
  }
}

const mapAssignees = ({ calendar, report, overrideSchedules, appointments = [] }) => (
  report.assignees.map((assignee) => {
    const assigneeId = assignee.assigneeId

    if (assigneeId && !assignee.type) {
      const hours = mapAssigneeHours({ assigneeId, overrideSchedules })
      const assigneesAppointments = appointments.filter(ap => ap.assigneeId === assigneeId)

      return {
        ...assignee,
        patients: mapPatients({ patients: assignee.patients, hours }),
        revenue: mapRevenue({ revenue: assignee.revenue, hours }),
        hours,
        workload: mapWorkload({ calendar, hours, appointments: assigneesAppointments })
      }
    } else {
      return assignee
    }
  })
)

export const mapHours = ({ calendar, report, overrideSchedules, appointments }) => {
  return {
    ...report,
    assignees: mapAssignees({ calendar, report, overrideSchedules, appointments })
  }
}
