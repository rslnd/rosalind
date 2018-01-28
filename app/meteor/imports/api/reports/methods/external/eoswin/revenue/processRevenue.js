import moment from 'moment-timezone'
import { parse as csvToJson } from 'papaparse'
import { dateToDay } from '../../../../../../util/time/day'
import { preprocessRevenue } from './preprocessRevenue'
import { postprocessRevenue } from './postprocessRevenue'
import { translateAssigneeIds } from '../translateAssigneeIds'

export const parseCsv = csv =>
  csvToJson(String(csv), { header: true }).data

export const processRevenue = mapIds => (csv, filename) => {
  const rows = parseCsv(csv)
  const day = parseDayFromFilename(filename)
  const summed = preprocessRevenue(rows)
  const translated = translateAssigneeIds(mapIds)(summed)
  const addendum = postprocessRevenue(translated)

  return {
    type: 'eoswinRevenue',
    ...addendum,
    day
  }
}

export const parseDayFromFilename = (filename, timezone = 'Europe/Vienna') =>
  dateToDay(moment.tz(filename, 'YYYYMMDD', timezone))
