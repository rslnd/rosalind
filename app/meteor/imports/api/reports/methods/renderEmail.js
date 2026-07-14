import moment from 'moment-timezone'

const nf0 = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 1 })

const int = n => (n == null || Number.isNaN(n)) ? '–' : nf0.format(n)
const pct = v => (v == null || Number.isNaN(v)) ? '–' : `${nf1.format(v * 100)} %`

const fmtDate = d => d ? moment(d).locale('de-AT').format('D. MMM YYYY') : '–'

// " (VJ <value>)" suffix, or empty when there is no previous-year value.
const vj = (prev, fmt) => (prev == null || Number.isNaN(prev)) ? '' : ` (VJ ${fmt(prev)})`

const renderTotal = (current, previous) => {
  // Default params only apply to `undefined`; previous.total is `null` when
  // there is no previous-year window, so normalize explicitly here.
  const cur = current || {}
  const prev = previous || {}
  return [
    'ORDINATION GESAMT',
    `Auslastung (Zeit): ${pct(cur.timeUtilization)}${vj(prev.timeUtilization, pct)}`,
    `Auslastung (Online-Slots): ${pct(cur.slotUtilization)}${vj(prev.slotUtilization, pct)}`,
    `Termine gesamt: ${int(cur.total)}${vj(prev.total, int)}`,
    `Nicht erschienen: ${int(cur.noShow)} / ${pct(cur.noShowRate)}${vj(prev.noShowRate, pct)}`,
    `Kasse / Privat: ${int(cur.insurance)} / ${int(cur.private)}`,
    `Online gebucht: ${int(cur.online)}${vj(prev.online, int)}`,
    `Online nicht erschienen: ${int(cur.onlineNoShow)} / ${pct(cur.onlineNoShowRate)}${vj(prev.onlineNoShowRate, pct)}`
  ].join('\n')
}

const renderAssignee = (a) => {
  const cur = a.current || {}
  const prev = a.previous || {}
  return [
    a.name,
    `  Termine ${int(cur.total)}${vj(prev.total, int)}`,
    `  Nicht ersch. ${int(cur.noShow)} / ${pct(cur.noShowRate)}${vj(prev.noShowRate, pct)}`,
    `  Auslastung ${pct(cur.timeUtilization)}${vj(prev.timeUtilization, pct)}`,
    `  Online ${int(cur.online)}${vj(prev.online, int)}`
  ].join('\n')
}

export const renderEmail = ({ statistics }) => {
  const cur = statistics.current || {}
  const prev = statistics.previous || {}

  const title = `Tagesbericht Statistik – ${fmtDate(cur.from)} bis ${fmtDate(cur.to)}`

  const header = [
    'Tagesbericht – Statistik',
    `Zeitraum: ${fmtDate(cur.from)} – ${fmtDate(cur.to)} (letzte ${statistics.windowDays} Tage)`,
    'Vergleich jeweils mit demselben Zeitraum im Vorjahr (VJ).'
  ].join('\n')

  const totalSection = renderTotal(cur.total, prev.total)

  const assigneesSection = [
    'PRO ÄRZTIN',
    (statistics.assignees || []).map(renderAssignee).join('\n\n')
  ].join('\n\n')

  const footer = 'Details inkl. Grafik (Vorlaufzeit der Terminbuchung) im PDF-Anhang.'

  const text = [header, totalSection, assigneesSection, footer].join('\n\n\n')

  return { title, text }
}
