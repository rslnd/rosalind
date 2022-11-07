import moment from 'moment-timezone'
import groupBy from 'lodash/fp/groupBy'
import sortBy from 'lodash/fp/sortBy'
import mapValues from 'lodash/fp/mapValues'
import map from 'lodash/map'

export const overridesToColumns = ({ day, calendar, overrides, constraints, appointments, tags }) => {
  const overridesByAssignee = groupBy('userId')(overrides)
  const sortedOverridesByAssignee = mapValues(sortBy('start'))(overridesByAssignee)
  const mergedOverridesByAssignee = mapValues(o => {
    const { merged } = mergeOverridesByAssignee(o)
    return merged
  })(sortedOverridesByAssignee)

  return map(mergedOverridesByAssignee, (overrides, assigneeId) => ({
    overrides,
    tags,
    assigneeId,
    calendar,
    day,
    constraints: constraints.filter(c => c.assigneeIds.includes(assigneeId)),
    appointments: sortBy('start')(appointments.filter(a => a.assigneeId === assigneeId))
  }))
}

const mergeOverridesByAssignee = overrides =>
  overrides.reduce(({ merged, skip }, curr) => {
    if (skip.includes(curr._id)) {
      return { merged, skip }
    }

    const extendedEnd = moment(curr.end).add(1, 'second').toDate()
    const overlapping = overrides.filter(o =>
      !skip.includes(o._id) &&
      o.start <= extendedEnd
    )

    if (overlapping.length >= 1) {
      const ends = overlapping.map(s => s.end)
      const end = new Date(Math.max(...ends))

      const result = {
        ...curr,
        end
      }

      return {
        merged: [...merged, result],
        skip: [...skip, ...overlapping.map(o => o._id)]
      }
    } else {
      return {
        merged: [...merged, curr],
        skip
      }
    }
  }, { merged: [], skip: [] })
