import identity from 'lodash/identity'
import negate from 'lodash/negate'
import mean from 'lodash/mean'
import sum from 'lodash/sum'
import min from 'lodash/min'
import max from 'lodash/max'
import sortBy from 'lodash/fp/sortBy'
import uniqBy from 'lodash/fp/uniqBy'
import last from 'lodash/last'
import idx from 'idx'
import _moment from 'moment'
import { extendMoment } from 'moment-range'
import { dayToDate } from '../../../util/time/day'
import { getRange, getQ } from '../../../util/time/quarter'

const moment = extendMoment(_moment)

export const mapQuarter = ({ day, reports, overrideSchedules, holidays }) => {
  const days = mapDays({ reports, day, overrideSchedules, holidays })
  return {
    day,
    days,
    q: getQ(dayToDate(day)),
    revenue: mapRevenue({ reports, days }),
    patients: mapPatients(reports)
  }
}

const mapRevenue = ({ reports, days }) => {
  const revenues = reports
    .map(r => idx(r, _ => _.total.revenue.actual))
    .filter(identity)

  const accumulated = sum(revenues)
  const averagePerDay = mean(revenues)
  const projected = accumulated + (averagePerDay * days.future)

  return {
    accumulated,
    averagePerDay,
    projected,
    min: min(revenues),
    max: max(revenues)
  }
}

const mapNewPerHour = reports => {
  const values = reports
    .map(r => r.average.patients.new.actualPerHour)
    .filter(identity)

  return {
    average: mean(values),
    min: min(values),
    max: max(values)
  }
}

const mapNoShow = reports => {
  const values = reports
    .map(r =>
      idx(r, _ => _.total.patients.total.noShow) /
      idx(r, _ => _.total.patients.total.expected)
    )

  return {
    average: mean(values),
    min: min(values),
    max: max(values)
  }
}

const mapPatients = reports => ({
  newPerHour: mapNewPerHour(reports),
  noShow: mapNoShow(reports)
})

const isHoliday = holidays => d =>
  holidays.map(h => moment.range(h.start, h.end)).some(r => r.contains(d))

const isWeekend = d => (d.isoWeekday() === 6 || d.isoWeekday() === 7)

const mapDays = ({ reports, day, overrideSchedules, holidays }) => {
  const passed = reports.length

  const date = dayToDate(day)

  const planned = uniqBy(d => d.format('YYYYMMDD'))(overrideSchedules
    .map(s => moment(s.start))
    .filter(m => m.isAfter(date))).length

  const lastPlannedDay = moment(last(sortBy('start')(overrideSchedules)).start)

  const quarter = getRange(date)
  const unplanned = Array.from(moment.range(lastPlannedDay, quarter.end).by('day'))

  const unplannedAvailable = unplanned
    .filter(negate(isWeekend))
    .filter(negate(isHoliday(holidays))).length

  const future = planned + unplannedAvailable
  const available = passed + future

  return {
    available,
    passed,
    planned,
    future,
    unplannedAvailable
  }
}