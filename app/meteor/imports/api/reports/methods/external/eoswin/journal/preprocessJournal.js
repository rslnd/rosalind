import map from 'lodash/map'
import mapValues from 'lodash/fp/mapValues'
import add from 'lodash/fp/add'
import groupBy from 'lodash/fp/groupBy'
import identity from 'lodash/fp/identity'
import { isNew, isSurgery, isCautery, isAny } from '../insuranceCodes'

export const preprocessJournal = rows => {
  const mapped = rows.map(mapRow).filter(identity)
  const grouped = groupBy('assignee')(mapped)
  const summed = mapValues(a => a.reduce(sumRows, {}))(grouped)

  return summed
}

const mapRow = (row) => {
  switch (row.Kurzz) {
    case 'L:': return parseAppointmentType(row)
  }
}

const parseAppointmentType = (row) => {
  const codes = parenthesesToArray(row.Text).map(s => s.toUpperCase())
  return {
    isAdmitted: isAny(codes) || isMissingReimbursement(row.Text),
    isNew: isNew(codes),
    isSurgery: isSurgery(codes),
    isCautery: isCautery(codes),
    isMissingReimbursement: isMissingReimbursement(row.Text),
    assignee: row.Assignee
  }
}

export const parenthesesToArray = (string) => {
  const match = string.match(/\[([^\]]+)\]/g)
  return match && match.map(s => s.replace(/\[|\]/g, '')) || []
}

const isMissingReimbursement = (text) =>
  text.includes('Keine Leistung(en) eingetragen')

const sumRows = (acc, curr, i) => {
  return {
    total: incrementIf(curr.isAdmitted)(acc.total),
    new: incrementIf(curr.isNew)(acc.new),
    surgery: incrementIf(curr.isSurgery)(acc.surgery),
    cautery: incrementIf(curr.isCautery)(acc.cautery),
    missingReimbursement: incrementIf(curr.isMissingReimbursement)(acc.missingReimbursement)
  }
}

export const incrementIf = condition => value =>
  condition ? ((parseInt(value) || 0) + 1) : (parseInt(value) || 0)

export const total = key => result =>
  map(result, v => v[key]).reduce(add, 0)
