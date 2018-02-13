import moment from 'moment-timezone'
import idx from 'idx'
import identity from 'lodash/identity'
import sum from 'lodash/sum'
import dedent from 'dedent'
import { dayToDate } from '../../../util/time/day'
import { float, percentage, currencyRounded } from '../../../util/format'

const isNull = s => s &&
  (typeof s === 'string' && s.match(/false|undefined| null|NaN/g) ||
  (typeof s === 'string' && s.match(/reports\./g)) ||
  (typeof s === 'string' && s.length === 0) ||
  (typeof s === 'number' && s === 0))

const renderLine = (text, value, separator = ': ') => {
  if (text && value && !isNull(value)) {
    return [text, value].join(separator)
  }
}

export const renderHeader = ({ day }) => {
  return dedent`
    Tagesbericht für ${moment(dayToDate(day)).locale('de-AT').format('dddd, D. MMMM YYYY')}
    Kalenderwoche ${moment(dayToDate(day)).isoWeek()}
  `
}

export const renderSummary = ({ report, mapCalendar }) => {
  return dedent`
    ${mapCalendar(report.calendarId).name}
    Gesamtumsatz: ${currencyRounded(
      idx(report, _ => _.total.revenue.total.actual) ||
      idx(report, _ => _.total.revenue.total.expected))}
    Auslastung: ${
      percentage({ value: report.total.workload.weighted }) ||
      percentage({ part: report.total.workload.actual, of: report.total.workload.available })}
    }
  `
}

export const renderBody = ({ report, mapUserIdToName, mapAssigneeType }) => {
  const renderAssignee = (assignee, i) => {
    const name = mapUserIdToName(assignee.assigneeId) || assignee.type && mapAssigneeType(assignee.type) || 'Ohne Zuweisung'
    const rankAndName = assignee.assigneeId && `${i + 1} - ${name}` || name
    const revenue = assignee.revenue &&
      (currencyRounded(idx(assignee, _ => _.revenue.total.actual)) ||
      currencyRounded(idx(assignee, _ => _.revenue.total.expected)))
    const newPerHour = float(idx(assignee, _ => _.patients.new.actualPerHour))
    const patientsActual = idx(assignee, _ => _.patients.total.actual)
    const patientsPlanned = idx(assignee, _ => _.patients.total.planned)
    const surgery = idx(assignee, _ => _.patients.surgery.actual)
    const cautery = idx(assignee, _ => _.patients.cautery.planned)
    const workload = percentage({
      part: idx(assignee, _ => _.patients.total.actual),
      of: idx(assignee, _ => _.patients.total.expected)
    })

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

export const renderFooter = () => {
  return dedent`

    Der detaillierte Tagesbericht befindet sich im Anhang.

    Danke!

  `
}

export const renderEmail = ({ reports, mapUserIdToName, mapAssigneeType, mapCalendar }) => {
  const day = reports[0].day
  const totalRevenue = sum(reports.map(r =>
    idx(r, _ => _.total.revenue.total.actual) ||
    idx(r, _ => _.total.revenue.total.expected) || 0))

  const title = `Tagesbericht für ${moment(dayToDate(day)).locale('de-AT').format('dddd, D. MMMM YYYY')} - Umsatz ${currencyRounded(totalRevenue)}`

  const header = renderHeader({ day })

  const body = reports.map(report => {
    const summary = renderSummary({ report, mapUserIdToName, mapCalendar })
    const reportBody = renderBody({ report, mapUserIdToName, mapAssigneeType })
    return [summary, reportBody].join('\n\n')
  }).join('\n\n\n')

  const footer = renderFooter()

  const text = [header, body, footer].join('\n\n')

  if (isNull(title)) {
    throw new Error(`Title contains 'null': ${title}`)
  }

  if (isNull(text)) {
    throw new Error(`Text contains 'null': ${text}`)
  }

  return { title, text }
}
