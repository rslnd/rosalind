import moment from 'moment-timezone'
import find from 'lodash/fp/find'
import findLast from 'lodash/fp/findLast'
import { parse as csvToJson } from 'papaparse'
import { dateToDay } from '../../../../../../util/time/day'
import { preprocessJournal } from './preprocessJournal'
import { postprocessJournal } from './postprocessJournal'
import { translateAssigneeIds } from '../translateAssigneeIds'

export const parseCsv = csv =>
  csvToJson(csv, { header: true }).data

export const processJournal = mapIds => csv => {
  const rows = parseCsv(csv)
  const day = parseDayFromRows(rows, r => r.Kurzz === 'L:' && r.Datum)
  const summed = preprocessJournal(rows)
  const translated = translateAssigneeIds(mapIds)(summed)
  const addendum = postprocessJournal(translated)

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
