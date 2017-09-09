import moment from 'moment-timezone'
import { parse as csvToJson } from 'papaparse'
import { dateToDay } from '../../../../../../util/time/day'
import { preprocessRevenue } from './preprocessRevenue'
import { postprocessRevenue } from './postprocessRevenue'

export const parseCsv = csv =>
  csvToJson(csv, { header: true }).data

export const processRevenue = (csv, filename) => {
  const rows = parseCsv(csv)
  const day = parseDayFromFilename(filename)
  const summed = preprocessRevenue(rows)
  const addendum = postprocessRevenue(summed)

  return {
    ...addendum,
    day
  }
}

export const parseDayFromFilename = (filename, timezone = 'Europe/Vienna') =>
  dateToDay(moment.tz(filename, 'YYYYMMDD', timezone))
