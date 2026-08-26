import moment from 'moment-timezone'

// Human labels for a date range: a compact form for legends (e.g. "Q3 2025",
// "2025", "Aug 2025") and a full numeric form (e.g. "1.7.2025–30.9.2025").
export const periodLabel = (from, to) => {
  if (!from || !to) { return { compact: '', numeric: '' } }
  const f = moment(from)
  const t = moment(to)
  const numeric = `${f.format('D.M.YYYY')}–${t.format('D.M.YYYY')}`

  const isStart = (m, unit) => m.isSame(m.clone().startOf(unit), 'day')
  const isEnd = (m, unit) => m.isSame(m.clone().endOf(unit), 'day')

  // `named` = the compact form is a short label (Q3 2025 / 2025 / Aug 2025), so
  // the numeric range adds information. Otherwise compact IS a date range and
  // the numeric would be redundant → omit it (compact once is enough).
  let compact
  let named = true
  if (f.isSame(t, 'year') && isStart(f, 'year') && isEnd(t, 'year')) {
    compact = `${f.year()}` // whole calendar year
  } else if (f.isSame(t, 'quarter') && isStart(f, 'quarter') && isEnd(t, 'quarter')) {
    compact = `Q${f.quarter()} ${f.year()}` // whole quarter
  } else if (f.isSame(t, 'month') && isStart(f, 'month') && isEnd(t, 'month')) {
    compact = f.format('MMM YYYY') // whole month
  } else {
    compact = `${f.format('D.M.')}–${t.format('D.M.YY')}`
    named = false
  }
  return { compact, numeric: named ? numeric : '' }
}
