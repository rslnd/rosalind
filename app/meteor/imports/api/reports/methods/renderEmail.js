import moment from 'moment-timezone'
import idx from 'idx'
import identity from 'lodash/identity'
import dedent from 'dedent'
import { dayToDate } from '../../../util/time/day'
import { float, percentage, currencyRounded } from '../../../util/format'

const isNull = s => s &&
  (typeof s === 'string' && s.match(/false|undefined| null|NaN/g) ||
  (typeof s === 'string' && s.length === 0) ||
  (typeof s === 'number' && s === 0))

const renderLine = (text, value, separator = ': ') => {
  if (text && value && !isNull(value)) {
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
    ÄrztInnen: ${report.total.assignees}
    Auslastung: ${percentage({ value: report.total.workload.weighted })}
  `
}

export const renderBody = ({ report, mapUserIdToName, mapAssigneeType }) => {
  const renderAssignee = (assignee, i) => {
    const name = mapUserIdToName(assignee.assigneeId) || assignee.type && mapAssigneeType(assignee.type) || 'Ohne Zuweisung'
    const rankAndName = assignee.assigneeId && `${i + 1} - ${name}` || name
    const revenue = assignee.revenue && currencyRounded(idx(assignee, _ => _.revenue.total.actual))
    const newPerHour = float(idx(assignee, _ => _.patients.new.actualPerHour))
    const patientsActual = idx(assignee, _ => _.patients.total.actual)
    const patientsPlanned = idx(assignee, _ => _.patients.total.planned)
    const surgery = idx(assignee, _ => _.patients.surgery.actual)
    const cautery = idx(assignee, _ => _.patients.cautery.planned)
    const workload = percentage({ value: idx(assignee, _ => _.workload.weighted) })

    return [
      rankAndName,
      renderLine('Umsatz', revenue),
      renderLine('Neu / Stunde', newPerHour),
      renderLine('Auslastung', workload),
      renderLine('PatientInnen', patientsActual || patientsPlanned),
      renderLine('OPs', surgery),
      renderLine('Kaustik', cautery)
    ].filter(identity).filter(s => !isNull(s)).join('\n').replace(/(\n+)/g, '\n')
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

  if (isNull(title) || isNull(text)) {
    throw new Error(`Email contains 'null': ${title} - ${text}`)
  }

  return { title, text }
}
