import moment from 'moment'
import { parse as csvToJson } from 'papaparse'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import filter from 'lodash/fp/filter'
import sortBy from 'lodash/fp/sortBy'
import reverse from 'lodash/fp/reverse'

export const parseReportDate = (name) => {
  if (name.includes('bis')) {
    throw new Error('Report must not contain more than one day')
  }

  const matchDate = name.match(/vom (\d{2})\.(\d{2}).(\d{4})/)
  const matchTime = name.match(/Uhrzeit (\d{2})(\d{2})/)

  if (matchDate && matchTime) {
    const [day, month, year] = matchDate.splice(1)
    const [hour, minute] = matchTime.splice(1)
    const date = moment({ day, month: month - 1, year, hour, minute }).toDate()
    return date
  } else {
    throw new Error('Report filename must contain date and time')
  }
}

export const insuranceCodes = {
  surgeries: 502,
  newPatients: 540
}

export const matchInsuranceCode = (text, key) => {
  if (text && text.length > 5) {
    const code = insuranceCodes[key]
    const regexp = new RegExp(`\\[${code}\\] \\* (\\d+)`)
    const match = text.match(regexp)
    return match && parseInt(match[1])
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
export const parseAssignees = (rows) => {
  let assignees = {}
  let currentAssigneeId = null

  rows.forEach((record) => {
    let assignee = assignees[currentAssigneeId]

    if (record.KZ.match(/A\d+/)) {
      currentAssigneeId = record.KZ

      if (!(assignees[currentAssigneeId] &&
        assignees[currentAssigneeId].patients &&
        assignees[currentAssigneeId].patients.total)) {
        assignees[currentAssigneeId] = {
          external: {
            eoswin: {
              id: currentAssigneeId,
              name: record.BEZ
            }
          },
          revenue: 0,
          patients: {
            new: 0,
            surgeries: 0,
            recall: 0,
            total: 0
          }
        }
      }
    }

    const newPatients = matchInsuranceCode(record.BEZ, 'newPatients')
    if (newPatients) {
      assignee.patients.new += newPatients
    }

    const surgeries = matchInsuranceCode(record.BEZ, 'surgeries')
    if (surgeries) {
      assignee.patients.surgeries += surgeries
    }

    if (record.KZ === 'KS') {
      assignee.patients.total += parseInt(record.BEZ)
    }

    if (record.KZ === 'E') {
      assignee.revenue += parseFloat(parseFloat(record.WERT).toFixed(2))
    }
  })

  assignees = flow(
    filter((a) => a.patients.total > 0),
    map((a) => {
      if (a.patients.total < a.patients.new) {
        a.patients.total = a.patients.new
      }
      a.patients.recall = a.patients.total - a.patients.new
      return a
    }),
    sortBy('revenue'),
    reverse
  )(assignees)

  return assignees
}

export const parseReport = (csv) => {
  const json = csvToJson(csv, { header: true }).data
  const assignees = parseAssignees(json)
  return { assignees }
}
