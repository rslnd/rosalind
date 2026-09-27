// Helpers for laying several cohorts' monthly series onto one shared x-axis.
// Cohorts may span different periods, so the axis is the union of every month
// that appears in any cohort (sorted). Cohorts that share a period line up on
// the same slots; cohorts with different periods occupy their own slots.

const MONTHS_DE = ['Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

// "Aug 25" style label from a "YYYY-MM" key.
export const monthLabel = (key) => {
  const [y, m] = key.split('-')
  return `${MONTHS_DE[Number(m) - 1]} ${y.slice(2)}`
}

// Short "Aug" label (no year) from a "YYYY-MM" key.
export const monthShort = (key) => MONTHS_DE[Number(key.split('-')[1]) - 1]

// Sorted union of month keys across the given month arrays (each element having
// a `.month` = "YYYY-MM"). Nullish arrays are ignored.
export const monthUnion = (...monthArrays) => {
  const set = new Set()
  monthArrays.forEach(arr => (arr || []).forEach(m => set.add(m.month)))
  return Array.from(set).sort()
}

// Index a cohort's months by key → numeric value via `accessor`.
export const byMonth = (months, accessor) => {
  const map = {}
  ;(months || []).forEach(m => { map[m.month] = accessor(m) })
  return map
}
