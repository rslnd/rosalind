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
  const day = parseDayFromRows(rows)
  const summed = preprocessJournal(rows)
  const translated = translateAssigneeIds(mapIds)(summed)
  const addendum = postprocessJournal(translated)

  return {
    type: 'eoswinJournal',
    ...addendum,
    day
  }
}

export const parseDayFromRows = (rows, timezone = 'Europe/Vienna') => {
  const isDateRow = r => r && r.Kurzz === 'L:' && r.Datum
  const first = find(isDateRow)(rows)
  const last = findLast(isDateRow)(rows)

  if (!first || !last) {
    throw new Error('Journal appears to be empty')
  }

  if (first.Datum !== last.Datum) {
    throw new Error('Journal may only include a single day')
  }

  return dateToDay(moment.tz(first, 'DD.MM.YYYY', timezone))
}
