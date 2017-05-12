import moment from 'moment-timezone'
import { parse as csvToJson } from 'papaparse'
import set from 'lodash/set'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import filter from 'lodash/fp/filter'
import sortBy from 'lodash/fp/sortBy'
import reverse from 'lodash/fp/reverse'

export const parseReportDate = (name, timezone = 'Europe/Vienna') => {
  if (name.includes('bis')) {
    throw new Error('Report must not contain more than one day')
  }

  const matchDate = name.match(/vom (\d{2})\.(\d{2}).(\d{4})/)
  const matchTime = name.match(/Uhrzeit (\d{2})(\d{2})/)

  if (matchDate && matchTime) {
    const [day, month, year] = matchDate.splice(1)
    const [hour, minute] = matchTime.splice(1)
    const date = moment.tz({ day, month: month - 1, year, hour, minute }, timezone).toDate()
    return date
  } else {
    throw new Error('Report filename must contain date and time')
  }
}

export const insuranceCodes = {
  surgery: 502,
  new: 540
}

export const getTagBilledCount = (rawLine, tag) => {
  if (rawLine && rawLine.length > 5) {
    const code = insuranceCodes[tag]
    const regexp = new RegExp(`\\[${code}\\] \\* (\\d+)`)
    const count = rawLine.match(regexp)
    return count && parseInt(count[1])
  }
}

// field | label                  | meaning
// ----------------------------------------------------------------------
// KZ    | Kurzzeichen            | type, one of:
// - Ax  | - Arzt                 | - start of report for next assignee,
//       |                        |     where x is an ID
// - KS  | - Summe Krankenscheine | - total number of patients
// - E   | - Ergebnis             | - total revenue
// WERT  | Wert                   | revenue of one line item
// BEZ   | Bezeichnung            | assignee's name or insurance code

export const matchAssigneeId = (slug) => {
  const id = slug && slug.match(/^A(\d+)$/)
  return id && id[1]
}

const initializeNewAssignee = () => {
  const assignee = {}
  set(assignee, 'patients.new.actual', 0)
  set(assignee, 'patients.surgery.actual', 0)
  set(assignee, 'patients.recall.actual', 0)
  set(assignee, 'patients.total.actual', 0)
  set(assignee, 'revenue.total.actual', 0)
  return assignee
}

export const parseAssignees = (rows) => {
  let assignees = {}
  let currentAssigneeId = null

  rows.map((row) => {
    let assignee = assignees[currentAssigneeId]

    const newAssigneeId = matchAssigneeId(row.KZ)
    if (newAssigneeId) {
      currentAssigneeId = newAssigneeId
      assignees[currentAssigneeId] = initializeNewAssignee()
      assignee = assignees[currentAssigneeId]
      assignee.assigneeId = currentAssigneeId
    }

    const newPatients = getTagBilledCount(row.BEZ, 'new')
    if (newPatients) {
      assignee.patients.new.actual += newPatients
    }

    const surgery = getTagBilledCount(row.BEZ, 'surgery')
    if (surgery) {
      assignee.patients.surgery.actual += surgery
    }

    // KS: Krankenscheine: total number of patients for assignee
    if (row.KZ === 'KS') {
      assignee.patients.total.actual += parseInt(row.BEZ)
    }

    // E: Ergebnis: total revenue for assignee
    if (row.KZ === 'E') {
      assignee.revenue.total.actual += parseFloat(row.WERT)
    }
  })

  const asArray = flow(
    filter(a => a.patients.total.actual > 0),
    map(a => {
      if (a.patients.total.actual < a.patients.new.actual) {
        a.patients.total.actual = a.patients.new.actual
      }

      a.patients.recall.actual = a.patients.total.actual - a.patients.new.actual
      return a
    }),
    sortBy('revenue.total.actual'),
    reverse
  )(assignees)

  return asArray
}

export const parseReport = (csv) => {
  const json = csvToJson(csv, { header: true }).data
  const assignees = parseAssignees(json)

  return { assignees }
}
