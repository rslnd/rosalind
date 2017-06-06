import moment from 'moment-timezone'
import idx from 'idx'
import identity from 'lodash/identity'
import dedent from 'dedent'
import { dayToDate } from '../../../util/time/day'
import { float, percentage, currencyRounded } from '../../../util/format'

const notNull = s => s &&
  (typeof s === 'string' && !s.match(/false|undefined| null|NaN/g) ||
  (typeof s === 'number' && s !== 0))

const renderLine = (text, value, separator = ': ') => {
  if (text && value && notNull(value)) {
    return [text, value].join(separator)
  }
}

export const renderHeader = ({ report }) => {
  return dedent`
    Tagesbericht für ${moment(dayToDate(report.day)).locale('de-AT').format('dddd, D. MMMM YYYY')}
    Kalenderwoche ${moment(dayToDate(report.day)).isoWeek()}
  `
}

export const renderSummary = ({ report }) => {
  return dedent`
    Gesamtumsatz: ${currencyRounded(idx(report, _ => _.total.revenue.actual))}
    Neu / Stunde: ${float(idx(report, _ => _.average.patients.new.actualPerHour))}
    Termine: ${percentage({ part: idx(report, _ => _.total.workload.actual), of: idx(report, _ => _.total.workload.available) })}

    ÄrztInnen: ${report.total.assignees}
  `
}

export const renderBody = ({ report, mapUserIdToName, mapAssigneeType }) => {
  const renderAssignee = (assignee, i) => {
    const name = mapUserIdToName(assignee.assigneeId) || assignee.type && mapAssigneeType(assignee.type) || 'Ohne Zuweisung'
    const rankAndName = assignee.assigneeId && `${i + 1} - ${name}` || name
    const revenue = assignee.revenue && currencyRounded(idx(assignee, _ => _.revenue.total.actual))
    const workload = assignee.workload && percentage({ part: assignee.patients.total.actual, of: assignee.workload.planned })
    const newPerHour = float(idx(assignee, _ => _.patients.new.actualPerHour))
    const patientsActual = idx(assignee, _ => _.patients.total.actual)
    const patientsPlanned = idx(assignee, _ => _.patients.total.planned)
    const surgery = idx(assignee, _ => _.patients.surgery.actual)
    const cautery = idx(assignee, _ => _.patients.cautery.planned)

    return [
      rankAndName,
      renderLine('Umsatz', revenue),
      renderLine('Termine', workload),
      renderLine('Neu / Stunde', newPerHour),
      renderLine('PatientInnen', patientsActual || patientsPlanned),
      renderLine('OPs', surgery),
      renderLine('Kaustik', cautery)
    ].filter(identity).filter(notNull).join('\n').replace(/(\n+)/g, '\n')
  }

  const body = report.assignees.map(renderAssignee).join('\n\n')

  return body
}

export const renderFooter = ({ report }) => {
  return dedent`

    Der detaillierte Tagesbericht befindet sich im Anhang.

    Danke!

  `
}

export const renderEmail = ({ report, mapUserIdToName, mapAssigneeType }) => {
  const title = `Tagesbericht für ${moment(dayToDate(report.day)).locale('de-AT').format('dddd, D. MMMM YYYY')} - Umsatz ${currencyRounded(report.total.revenue.actual)}`

  const header = renderHeader({ report, mapUserIdToName })
  const summary = renderSummary({ report, mapUserIdToName })
  const body = renderBody({ report, mapUserIdToName, mapAssigneeType })
  const footer = renderFooter({ report })

  const text = [header, summary, body, footer].join('\n\n')

  return { title, text }
}
