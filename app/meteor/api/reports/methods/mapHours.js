import mapValues from 'lodash/fp/mapValues'
import groupBy from 'lodash/fp/groupBy'
import identity from 'lodash/identity'
import { calculateScheduledHours } from '../../schedules/methods/getScheduledHours'

const mapAssigneeHours = ({ assigneeId, overrideSchedules }) => {
  const assigneeOverrideSchedules = groupBy('userId')(overrideSchedules)[assigneeId]
  return {
    planned: calculateScheduledHours({ overrideSchedules: assigneeOverrideSchedules })
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

const mapWorkload = ({ hours, appointments }) => {
  const available = hours.planned * 12
  const planned = appointments.length

  return {
    available,
    planned
  }
}

const mapAssignees = ({ report, overrideSchedules, appointments = [] }) => (
  report.assignees.map((assignee) => {
    const assigneeId = assignee.assigneeId

    if (assigneeId) {
      const hours = mapAssigneeHours({ assigneeId, overrideSchedules })
      const assigneesAppointments = appointments.filter(ap => ap.assigneeId === assigneeId)

      return {
        ...assignee,
        patients: mapPatients({ patients: assignee.patients, hours }),
        revenue: mapRevenue({ revenue: assignee.revenue, hours }),
        hours,
        workload: mapWorkload({ hours, appointments: assigneesAppointments })
      }
    } else {
      return assignee
    }
  })
)

export const mapHours = ({ report, overrideSchedules, appointments }) => {
  return {
    ...report,
    assignees: mapAssignees({ report, overrideSchedules, appointments })
  }
}
