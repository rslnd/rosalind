import map from 'lodash/map'
import mapValues from 'lodash/fp/mapValues'
import groupBy from 'lodash/fp/groupBy'
import identity from 'lodash/fp/identity'
import { isNew, isSurgery, isCautery, isCryo, isAny } from '../insuranceCodes'

export const preprocessJournal = rows => {
  const mapped = rows.map(mapRow).filter(identity)
  const grouped = groupBy('assignee')(mapped)
  const summed = mapValues(a => a.reduce(sumRows, {}))(grouped)

  return summed
}

const mapRow = (row, i, rows) => {
  switch (row.Kurzz) {
    case 'L:': return parseAppointmentType(row, i, rows)
  }
}

const isInsuredPatient = (row, i, rows) => {
  // Thw row above an 'L:' entry is a patient header
  const patientRow = rows[i - 1].Text
  if (patientRow.match(/Patient: {4}geb\. am/)) { return false }
  if (patientRow.match(/Kasse: PRIV/)) { return false }
  return true
}

const parseAppointmentType = (row, i, rows) => {
  const codes = parenthesesToArray(row.Text).map(s => s.toUpperCase())

  if (!isInsuredPatient(row, i, rows)) { return }

  return {
    isAdmitted: isAny(codes) || isMissingReimbursement(row.Text),
    isNew: isNew(codes),
    surgery: codes.filter(c => isSurgery([c])).length,
    cautery: codes.filter(c => isCautery([c])).length,
    cryo: codes.filter(c => isCryo([c])).length,
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
  const total = incrementIf(curr.isAdmitted)(acc.total)
  const _new = incrementIf(curr.isNew)(acc.new)
  const surgery = add(curr.surgery, acc.surgery)
  const cautery = add(curr.cautery, acc.cautery)
  const cryo = add(curr.cryo, acc.cryo)
  const missingReimbursement = incrementIf(curr.isMissingReimbursement)(acc.missingReimbursement)
  const recall = total - _new

  return { total, new: _new, recall, surgery, cautery, cryo, missingReimbursement }
}

const add = (a = 0, b = 0) => a + b

export const incrementIf = condition => value =>
  condition ? ((parseInt(value) || 0) + 1) : (parseInt(value) || 0)

export const total = key => result =>
  map(result, v => v[key]).reduce(add, 0)
