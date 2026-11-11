import moment from 'moment-timezone'

const nf0 = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 1 })

const int = n => (n == null || Number.isNaN(n)) ? '–' : nf0.format(n)
const pct = v => (v == null || Number.isNaN(v)) ? '–' : `${nf1.format(v * 100)} %`

const num = n => (n == null || Number.isNaN(n)) ? '–' : nf1.format(n)
const hours = n => (n == null || Number.isNaN(n)) ? '–' : `${nf1.format(n)} h`

const fmtDate = d => d ? moment(d).locale('de-AT').format('ddd, D. MMM YYYY') : '–'

const ratio = (v, base) => (base > 0 && v != null) ? v / base : null

// Absolute number with its share, e.g. "300 (58,6 % der Termine)"
const withShare = (abs, share, of) =>
  share == null ? int(abs) : `${int(abs)} (${pct(share)} ${of})`

// Same figures as the headline tiles at the top of the PDF report
const renderTotal = (total, { doctorCount, einschub }) => {
  const t = total || {}
  const base = t.total || 0
  const expected = t.expected || 0

  return [
    'ORDINATION GESAMT',
    `ÄrztInnen: ${int(doctorCount)}`,
    // Same base as the report: all appointments incl. Einschub vs. available slots
    `Auslastung: ${pct(ratio(t.total, t.slotsAvailable))}`,
    `Nicht-erschienen-Quote: ${pct(t.noShowRate)}`,
    `PatientInnen / Std: ${num(t.patientsPerHour)}`,
    '',
    `Slots: ${int(t.slotsAvailable)} (${hours(t.scheduledHours)} gesamt)`,
    `Termine: ${withShare(t.total, ratio(t.total, t.slotsAvailable), 'Auslastung')}`,
    `Einschub: ${withShare(einschub, ratio(einschub, base), 'der Termine')}`,
    `Kasse: ${withShare(t.insurance, ratio(t.insurance, base), 'der Termine')}`,
    `Privat: ${withShare(t.private, ratio(t.private, base), 'der Termine')}`,
    `Intern vereinbart: ${withShare(t.internal, ratio(t.internal, base), 'der Termine')}`,
    `Online: ${withShare(t.online, ratio(t.online, base), 'der Termine')}`,
    `Erschienen: ${withShare(t.admitted, ratio(t.admitted, expected), 'der erwarteten')}`,
    `Nicht erschienen: ${withShare(t.noShow, ratio(t.noShow, expected), 'der erwarteten')}`,
    `Storniert: ${withShare(t.canceled, ratio(t.canceled, base), 'der Termine')}`
  ].join('\n')
}

// Same columns as the per-doctor table in the PDF report
const renderAssignee = (a) => {
  const cur = a.current || {}
  return [
    a.name,
    `  Geplante Stunden: ${hours(cur.scheduledHours)}`,
    `  Auslastung: ${pct(cur.calendarSlotUtilization)}`,
    `  Slots: ${int(cur.slotsAvailable)}`,
    `  Termine: ${int(cur.total)}`,
    `  Erschienen: ${int(cur.admitted)}`,
    `  Kasse / Privat: ${int(cur.insurance)} / ${int(cur.private)}`,
    `  PatientInnen / Std: ${num(cur.patientsPerHour)}`
  ].join('\n')
}

export const renderEmail = ({ statistics }) => {
  const cur = statistics.current || {}
  const assignees = statistics.assignees || []

  const einschubRow = assignees.find(a => a.type === 'einschub')
  const doctorCount = assignees.filter(a => a.type !== 'einschub').length
  const einschub = einschubRow && einschubRow.current ? einschubRow.current.total : 0

  const title = `Tagesbericht – ${fmtDate(cur.from)}`

  const header = [
    'Tagesbericht',
    fmtDate(cur.from)
  ].join('\n')

  const totalSection = renderTotal(cur.total, { doctorCount, einschub })

  const assigneesSection = [
    'PRO ÄRZTIN',
    assignees.map(renderAssignee).join('\n\n')
  ].join('\n\n')

  const footer = 'Details inkl. Grafik (Vorlaufzeit der Terminbuchung) im PDF-Anhang.'

  const text = [header, totalSection, assigneesSection, footer].join('\n\n\n') + '\n\n'

  return { title, text }
}
