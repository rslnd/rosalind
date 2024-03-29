import identity from 'lodash/identity'
import uniq from 'lodash/uniq'
import negate from 'lodash/negate'
import mean from 'lodash/mean'
import maxBy from 'lodash/fp/maxBy'
import sum from 'lodash/sum'
import min from 'lodash/min'
import max from 'lodash/max'
import idx from 'idx'
import _moment from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { dayToDate, dateToDay, isSame } from '../../../util/time/day'
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

export const sumQuarters = quarters => {
  const days = maxBy('passed')(quarters.map(q => q.days))

  return quarters.reduce((acc, curr) =>
    ({
      day: curr.day,
      days,
      q: curr.q,
      revenue: {
        accumulated: acc.revenue.accumulated + curr.revenue.accumulated,
        averagePerDay: (acc.revenue.accumulated + curr.revenue.accumulated) / days.passed,
        projected: mean(quarters.map(q => q.revenue.projected)),
        min: min(quarters.map(q => q.revenue.min)),
        max: max(quarters.map(q => q.revenue.max))
      },
      patients: {
        newPerHour: {
          average: mean(quarters.map(q => q.patients.newPerHour.average).filter(identity)),
          min: min(quarters.map(q => q.patients.newPerHour.min).filter(identity)),
          max: max(quarters.map(q => q.patients.newPerHour.max).filter(identity))
        },
        noShow: {
          average: mean(quarters.map(q => q.patients.noShow.average)),
          min: min(quarters.map(q => q.patients.noShow.min)),
          max: max(quarters.map(q => q.patients.noShow.max))
        }
      }
    })
  )
}

const mapRevenue = ({ reports, days }) => {
  const revenues = reports
    .map(r =>
      idx(r, _ => _.total.revenue.actual) || // backwards compatibility
      idx(r, _ => _.total.revenue.total.actual) ||
      idx(r, _ => _.total.revenue.total.expected))
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
    .map(r => idx(r, _ => _.average.patients.new.actualPerHour))
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
      (idx(r, _ => _.total.patients.total.noShow) || 0) /
      idx(r, _ => _.total.patients.total.expected)
    ).filter(v => (v === 0 || v > 0))

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
  holidays.map(h => h.day).some(h => isSame(h, dateToDay(d)))

const isWeekend = d => (d.isoWeekday() === 6 || d.isoWeekday() === 7)

export const mapDays = ({ reports, day, holidays }) => {
  const passed = uniq(reports.map(r => dayToDate(r.day).toString())).length

  const date = dayToDate(day)

  const quarter = getRange(date)
  const allDays = Array.from(moment.range(quarter.start, quarter.end).by('day'))

  const future = allDays
    .filter(negate(isWeekend))
    .filter(negate(isHoliday(holidays))).length - passed

  const available = passed + future

  return {
    available,
    passed,
    future
  }
}
