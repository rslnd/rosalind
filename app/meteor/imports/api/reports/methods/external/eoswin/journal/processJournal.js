import moment from 'moment-timezone'
import find from 'lodash/fp/find'
import findLast from 'lodash/fp/findLast'
import { parse as csvToJson } from 'papaparse'
import { dateToDay } from '../../../../../../util/time/day'
import { preprocessJournal } from './preprocessJournal'
import { postprocessJournal } from './postprocessJournal'

export const parseCsv = csv =>
  csvToJson(csv, { header: true }).data

export const processJournal = csv => {
  const rows = parseCsv(csv)
  const day = parseDayFromRows(rows, r => r.Kurzz === 'L:' && r.Datum)
  const summed = preprocessJournal(rows)
  const addendum = postprocessJournal(summed)

  return {
    ...addendum,
    day
  }
}

export const parseDayFromRows = (rows, isDateRow, timezone = 'Europe/Vienna') => {
  const first = find(isDateRow)(rows).Datum
  const last = findLast(isDateRow)(rows).Datum

  if (first !== last) {
    throw new Error('Journal may only include a single day')
  } else {
    return dateToDay(moment.tz(first, 'DD.MM.YYYY', timezone))
  }
}
