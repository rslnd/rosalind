export const columnsToAvailabilities = columns =>
  columns.map(({ assigneeId, ...rest }) => ({
    ...rest,
    assigneeId,
    availabilities: overridesToAvailbilities({ assigneeId, ...rest })
  })).reduce((acc, { availabilities }) => [...acc, ...availabilities], [])

const overridesToAvailbilities = ({ overrides, ...rest }) =>
  overrides
    .map(o => ({ ...o, duration: durationMinutes(o.start, o.end) }))
    .filter(o => !(
      (o.duration < 1) ||
      (o.duration > (60 * 12))
    ))
    .reduce(({ availabilities, wip }, curr, i) => {
      if (i === 0) {
        return {
          availabilities,
          wip: startWith(curr, { overrides, ...rest })
        }
      }

      if (i === (overrides.length - 1)) {
        return {
          availabilities: [
            ...availabilities,
            {
              ...wip,
              ...endWith(wip, curr, { overrides, ...rest })
            }
          ]
        }
      }

      // We consider overrides <= 1h to be pauses
      if (curr.duration <= 61) {
        return {
          availabilities,
          wip: addPause(wip, curr, { overrides, ...rest })
        }
      }

      return {
        availabilities: [
          ...availabilities,
          {
            ...wip,
            ...endWith(wip, curr, { overrides, ...rest })
          }
        ],
        wip: startWith(curr, { overrides, ...rest })
      }
    }, { availabilities: [], wip: null }).availabilities

const startWith = (o, rest) => {
  const slotSize = slotSizeAt({
    ...rest,
    date: o.from
  })

  return {
    calendarId: o.calendarId,
    assigneeId: o.userId,
    from: o.end,
    slotSize,
    // These may go negative when pauses are added, but are correcten by endWith
    durationAvailable: 0,
    slotsAvailable: 0
  }
}

// Apply constraints here, count appointments, apply slot count to pauses
const endWith = (wip, o, { appointments, ...rest }) => {
  const to = o.start
  const { from, slotSize, durationAvailable } = wip
  const duration = durationMinutes(o.start, from)

  const slotCount = Math.round(duration / slotSize)
  const slotsAvailable = wip.slotsAvailable + slotCount
  const slotsUsed = appointments
    .filter(isWithin({ from: o.from, to }))
    .map(a => countSlots({ from: a.start, to: a.end, slotSize }))
    .reduce(sum, 0)

  const tags = getAvailableTags({ ...rest, slotSize, appointments, date: o.from })

  return {
    to,
    slotSize,
    slotCount,
    slotsAvailable,
    slotsUsed,
    duration,
    durationAvailable: durationAvailable + duration,
    tags
  }
}

const addPause = ({ slotSize, slotsAvailable, durationAvailable, ...availability }, o, rest) => {
  const slots = countSlots({ slotSize, from: o.start, to: o.end })
  const pauseDuration = durationMinutes(o.start, o.end)

  return {
    ...availability,
    slotSize,
    durationAvailable: durationAvailable - pauseDuration,
    slotsAvailable: slotsAvailable - slots,
    pauses: [
      ...(availability.pauses || []),
      {
        from: o.start,
        to: o.end,
        note: o.note,
        slots
      }
    ]
  }
}

// TODO: Implement
// TODO: Reactor to tags method
// We don't care about a tag's maxParallel attribute here,
// or whether its duration fits within the availability.
const getAvailableTags = ({ date, calendar, assigneeId, constraints, tags = [] }) => {
  return tags.map(t => t._id)
}

const slotSizeAt = ({ calendar }) =>
  calendar.slotSizeAppointment || calendar.slotSize || 5

const countSlots = ({ slotSize, from, to }) =>
  Math.round(durationMinutes(from, to) / slotSize)

const durationMinutes = (from, to) =>
  Math.round(Math.abs(Math.abs(to - from) / 1000 / 60))

const sum = (acc, curr) => acc + curr

const isWithin = ({ from, to }) => a => (
  (from <= a.start) &&
  (a.start <= to)
)
