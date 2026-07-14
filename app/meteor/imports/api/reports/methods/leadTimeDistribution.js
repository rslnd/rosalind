import groupBy from 'lodash/groupBy'

// Booking lead time = days between when the appointment was booked (createdAt)
// and the appointment date (start). Bucketed into ranges for a distribution graph.
export const BINS = [
  { label: 'Selber Tag', min: 0, max: 0 },
  { label: '1–3 T', min: 1, max: 3 },
  { label: '4–7 T', min: 4, max: 7 },
  { label: '1–2 Wo', min: 8, max: 14 },
  { label: '2–4 Wo', min: 15, max: 30 },
  { label: '1–2 Mo', min: 31, max: 60 },
  { label: '2–3 Mo', min: 61, max: 90 },
  { label: '> 3 Mo', min: 91, max: Infinity }
]

export const leadDays = (a) => {
  if (!a.start || !a.createdAt) { return null }
  const ms = new Date(a.start).getTime() - new Date(a.createdAt).getTime()
  const days = Math.floor(ms / 1000 / 60 / 60 / 24)
  return days < 0 ? 0 : days
}

const binIndex = (days) => {
  const i = BINS.findIndex(b => days >= b.min && days <= b.max)
  return i === -1 ? BINS.length - 1 : i
}

// Returns { counts: [...perBin], total, share: [...perBin fraction] }
export const histogram = (appointments = []) => {
  const counts = BINS.map(() => 0)
  let total = 0

  appointments.forEach((a) => {
    const days = leadDays(a)
    if (days == null) { return }
    counts[binIndex(days)] += 1
    total += 1
  })

  const share = counts.map(c => (total > 0 ? c / total : 0))
  return { counts, total, share }
}

// Builds one histogram series per year window (label = year).
//   yearWindows: [{ year, appointments }]
// Returns { bins: [labels], series: [{ year, counts, total, share }] }
export const leadTimeDistribution = ({ yearWindows = [] }) => {
  return {
    bins: BINS.map(b => b.label),
    series: yearWindows.map(({ year, appointments }) => ({
      year,
      ...histogram(appointments)
    }))
  }
}

// Same, but broken down per doctor. Returns a map assigneeId -> distribution.
export const leadTimeDistributionByAssignee = ({ yearWindows = [] }) => {
  const assigneeIds = new Set()
  yearWindows.forEach(({ appointments }) =>
    appointments.forEach(a => a.assigneeId && assigneeIds.add(a.assigneeId))
  )

  const result = {}
  assigneeIds.forEach((assigneeId) => {
    result[assigneeId] = leadTimeDistribution({
      yearWindows: yearWindows.map(({ year, appointments }) => ({
        year,
        appointments: groupBy(appointments, 'assigneeId')[assigneeId] || []
      }))
    })
  })
  return result
}
