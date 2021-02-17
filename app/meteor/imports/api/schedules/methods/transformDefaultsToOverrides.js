import leftPad from 'left-pad'
import findLastFrom from 'lodash/fp/findLastFrom'
import sortBy from 'lodash/fp/sortBy'
import groupBy from 'lodash/fp/groupBy'
import mapValues from 'lodash/fp/mapValues'
import flatMap from 'lodash/fp/flatMap'
import uniq from 'lodash/uniq'
import map from 'lodash/map'
import moment from 'moment-timezone'
import {
  dayToDate,
  zeroIndexMonth,
  dayToString,
  stringToDay,
  dateToDay
} from '../../../util/time/day'
import { HMtoString } from '../../../util/time/hm'

export const transformDefaultsToOverrides = ({ defaultSchedules, days }) => {
  const daysWithWeekday = days.map(day => ({
    ...day,
    weekday: weekday(day)
  }))

  // Prepare default schedules
  // Form columns via group by {calendar, weekday, user}
  // Sort within each column by schedule start time
  const byColumn = groupBy(groupKey)(defaultSchedules)
  const byColumnSorted = mapValues(sortByFrom)(byColumn)
  const overrideSchedules = flatMap(expandColumn(daysWithWeekday))(byColumnSorted)

  // Transform to day schedules
  const byDay = groupBy(toDayKey)(overrideSchedules)
  const assigneeIdsByDay = mapValues(uniqAssignees)(byDay)
  const daySchedules = map(assigneeIdsByDay, (userIds, dayKey) => {
    const { day, calendarId } = fromDayKey(dayKey)

    return {
      type: 'day',
      day,
      userIds,
      calendarId,
      available: true
    }
  })

  return [
    ...overrideSchedules,
    ...daySchedules
  ]
}

const toDayKey = o => [
  o.calendarId,
  dayToString(dateToDay(o.start))
].join('/')

const fromDayKey = s => {
  const [calendarId, dayString] = s.split('/')
  const day = stringToDay(dayString)
  return { calendarId, day }
}

const uniqAssignees = overrideSchedules =>
  uniq(overrideSchedules.map(s => s.userId))

const groupKey = s => [
  s.calendarId,
  s.userId,
  s.weekday
].join('-')

const sortByFrom = sortBy(s => HMtoString(s.from))

const expandColumn = days => defaultSchedulesByColumn => {
  return flatMap(day => {
    if (day.weekday !== defaultSchedulesByColumn[0].weekday) {
      return []
    }


    const unavailableSchedules = defaultSchedulesByColumn.filter(s => !s.available)
    const availableSchedules = defaultSchedulesByColumn.filter(s => s.available)

    const expandedUnAvailableSchedules = unavailableSchedules.map(s => {
      const { from, to, calendarId, userId, note, roles } = s

      return {
        type: 'override',
        available: false,
        calendarId,
        userId,
        note,
        roles,
        start: applyHM(day, from),
        end: applyHM(day, to)
      }
    })

    const expandedAvailableSchedules = availableSchedules.reduce((acc, curr, i) => {
      const { available, from, to, calendarId, userId, note, roles } = curr


      const props = {
        type: 'override',
        available: false,
        calendarId,
        userId,
        note,
        roles
      }

      const previousDefaultSchedule = availableSchedules[i - 1]

      // Only schedule of this column, block all else
      if (availableSchedules.length === 1) {
        return [{
          ...props,
          start: startOfDay(day),
          end: applyHM(day, from)
        }, {
          ...props,
          start: applyHM(day, to),
          end: endOfDay(day)
        }]
      }

      // First schedule of this column, block from start of day
      if (i === 0) {
        return [{
          ...props,
          start: startOfDay(day),
          end: applyHM(day, from)
        }, ...acc]
      }

      // Last schedule of day
      if (i === (availableSchedules.length - 1)) {
        return [{
          ...props,
          start: applyHM(day, to),
          end: endOfDay(day)
        }, {
          ...props,
          start: applyHM(day, previousDefaultSchedule.to),
          end: applyHM(day, from)
        }, ...acc]
      }

      // Inbetween
      return [{
        ...props,
        start: applyHM(day, previousDefaultSchedule.to),
        end: applyHM(day, from)
      }, ...acc]
    }, [])

    const expandedSchedules = [
      ...expandedUnAvailableSchedules,
      ...expandedAvailableSchedules,
    ]

    const isNonzero = s => s.start.getTime() !== s.end.getTime()
    return expandedSchedules.filter(isNonzero)
  })(days)
}

const weekday = day =>
  moment(dayToDate(day)).locale('en').format('ddd').toLowerCase()

export const applyHM = (day, hm) =>
  moment.tz(zeroIndexMonth(day), 'Europe/Vienna')
    .hours(hm.h || 0)
    .minute(hm.m || 0)
    .startOf('minute')
    .toDate()

const startOfDay = day =>
  applyHM(day, {
    h: 7,
    m: 30
  })

const endOfDay = day =>
  applyHM(day, {
    h: 21
  })
