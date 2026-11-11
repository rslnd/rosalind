import moment from 'moment-timezone'

const nf0 = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 1 })

const int = n => (n == null || Number.isNaN(n)) ? '–' : nf0.format(n)
const pct = v => (v == null || Number.isNaN(v)) ? '–' : `${nf1.format(v * 100)} %`

const fmtDate = d => d ? moment(d).locale('de-AT').format('D. MMM YYYY') : '–'

const renderTotal = (total) => {
  const cur = total || {}
  return [
    'ORDINATION GESAMT',
    `Auslastung (Zeit): ${pct(cur.timeUtilization)}`,
    `Auslastung (Online-Slots): ${pct(cur.slotUtilization)}`,
    `Termine gesamt: ${int(cur.total)}`,
    `Nicht erschienen: ${int(cur.noShow)} / ${pct(cur.noShowRate)}`,
    `Kasse / Privat: ${int(cur.insurance)} / ${int(cur.private)}`,
    `Online gebucht: ${int(cur.online)}`,
    `Online nicht erschienen: ${int(cur.onlineNoShow)} / ${pct(cur.onlineNoShowRate)}`
  ].join('\n')
}

const renderAssignee = (a) => {
  const cur = a.current || {}
  return [
    a.name,
    `  Termine ${int(cur.total)}`,
    `  Nicht ersch. ${int(cur.noShow)} / ${pct(cur.noShowRate)}`,
    `  Auslastung ${pct(cur.timeUtilization)}`,
    `  Online ${int(cur.online)}`
  ].join('\n')
}

export const renderEmail = ({ statistics }) => {
  const cur = statistics.current || {}

  const title = `Tagesbericht Statistik – ${fmtDate(cur.from)}`

  const header = [
    'Tagesbericht – Statistik',
    `Tag: ${fmtDate(cur.from)}`
  ].join('\n')

  const totalSection = renderTotal(cur.total)

  const assigneesSection = [
    'PRO ÄRZTIN',
    (statistics.assignees || []).map(renderAssignee).join('\n\n')
  ].join('\n\n')

  const footer = 'Details inkl. Grafik (Vorlaufzeit der Terminbuchung) im PDF-Anhang.'

  const text = [header, totalSection, assigneesSection, footer].join('\n\n\n')

  return { title, text }
}
