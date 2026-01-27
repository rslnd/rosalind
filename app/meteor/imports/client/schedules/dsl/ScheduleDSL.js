import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import moment from 'moment-timezone'
import sortBy from 'lodash/sortBy'
import { Schedules } from '../../../api/schedules'
import { Appointments } from '../../../api/appointments'
import { Users } from '../../../api/users'
import { dateToDay } from '../../../util/time/day'
import { subscribe } from '../../../util/meteor/subscribe'
import { timeSlots, setTime, label } from '../../appointments/dayView/grid/timeSlots'

const DEFAULT_STEP_DELAY = 300 // ms between operations for visibility

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// Wait for subscriptions to be ready
const waitForSubscriptions = (subs, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      computation.stop()
      reject(new Error('Subscription timeout'))
    }, timeout)

    const computation = Tracker.autorun(() => {
      const allReady = subs.every(sub => sub.ready())
      if (allReady) {
        clearTimeout(timeoutId)
        // Use Meteor.defer to stop computation outside of autorun
        Meteor.defer(() => computation.stop())
        resolve()
      }
    })
  })
}

export const createDSLContext = ({
  calendarId,
  calendar,
  history,
  basePath,
  onLog,
  onProgress,
  signal,
  getAssignees,
  getDaySchedule,
  getStepDelay,
  manualMode,
  requestConfirmation
}) => {
  // Use dynamic step delay or fall back to default
  const stepDelay = () => (getStepDelay ? getStepDelay() : DEFAULT_STEP_DELAY)
  let currentDate = null
  let totalDays = 0
  let processedDays = 0

  const log = (msg, type = 'info') => {
    onLog && onLog({ message: msg, type, timestamp: new Date() })
  }

  const checkAborted = () => {
    if (signal && signal.aborted) {
      throw new Error('Aborted by user')
    }
  }

  const findAssigneeByName = (name) => {
    const users = Users.find({}).fetch()
    const searchTerm = name.toLowerCase().trim()

    // Try exact matches first, then partial matches
    const match = users.find(u => {
      const username = (u.username || '').toLowerCase()
      const lastName = (u.lastName || '').toLowerCase()
      const firstName = (u.firstName || '').toLowerCase()
      const fullName = (Users.methods.fullNameWithTitle(u) || '').toLowerCase()

      // Exact matches (case-insensitive)
      if (username === searchTerm) return true
      if (lastName === searchTerm) return true
      if (fullName === searchTerm) return true

      // Partial matches
      if (username.includes(searchTerm)) return true
      if (lastName.includes(searchTerm)) return true
      if (fullName.includes(searchTerm)) return true
      if (firstName.includes(searchTerm)) return true

      return false
    })

    if (!match) {
      throw new Error(`Assignee not found: "${name}"`)
    }
    return match
  }

  const getDefaultSchedule = (userId, weekday) => {
    return Schedules.findOne({
      type: 'default',
      userId,
      calendarId,
      weekday: String(weekday)
    })
  }

  // Get ALL default schedules for a user/weekday (there can be multiple blocks)
  const getAllDefaultSchedules = (userId, weekdayNum) => {
    const weekdayNames = ['', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    const weekday = weekdayNames[weekdayNum]

    return Schedules.find({
      type: 'default',
      userId,
      calendarId,
      weekday
    }, { sort: { 'from.h': 1, 'from.m': 1 } }).fetch()
  }

  // Apply default schedules as override blocks (blocking unavailable times)
  const applyDefaultScheduleOverrides = async (userId, defaults) => {
    if (!defaults || defaults.length === 0) return

    const availableDefaults = defaults.filter(d => d.available !== false)
    const unavailableDefaults = defaults.filter(d => d.available === false)

    // Create override blocks for unavailable periods (pauses, breaks)
    for (const d of unavailableDefaults) {
      const start = timeToDate(currentDate, hmToString(d.from))
      const end = timeToDate(currentDate, hmToString(d.to))

      await Schedules.actions.insert.callPromise({
        schedule: {
          type: 'override',
          calendarId,
          userId,
          start: start.toDate(),
          end: end.toDate(),
          available: false,
          note: d.note || 'Pause'
        }
      })
    }

    // Create override blocks for times outside available periods
    if (availableDefaults.length > 0) {
      const dayStart = timeToDate(currentDate, '0730')
      const dayEnd = timeToDate(currentDate, '2100')

      // Sort by start time
      const sorted = availableDefaults.sort((a, b) => {
        const aTime = a.from.h * 60 + a.from.m
        const bTime = b.from.h * 60 + b.from.m
        return aTime - bTime
      })

      // Block before first available
      const firstStart = timeToDate(currentDate, hmToString(sorted[0].from))
      if (firstStart.isAfter(dayStart)) {
        await Schedules.actions.insert.callPromise({
          schedule: {
            type: 'override',
            calendarId,
            userId,
            start: dayStart.toDate(),
            end: firstStart.toDate(),
            available: false
          }
        })
      }

      // Block between available periods
      for (let i = 0; i < sorted.length - 1; i++) {
        const currEnd = timeToDate(currentDate, hmToString(sorted[i].to))
        const nextStart = timeToDate(currentDate, hmToString(sorted[i + 1].from))

        if (currEnd.isBefore(nextStart)) {
          await Schedules.actions.insert.callPromise({
            schedule: {
              type: 'override',
              calendarId,
              userId,
              start: currEnd.toDate(),
              end: nextStart.toDate(),
              available: false,
              note: 'Break'
            }
          })
        }
      }

      // Block after last available
      const lastEnd = timeToDate(currentDate, hmToString(sorted[sorted.length - 1].to))
      if (lastEnd.isBefore(dayEnd)) {
        await Schedules.actions.insert.callPromise({
          schedule: {
            type: 'override',
            calendarId,
            userId,
            start: lastEnd.toDate(),
            end: dayEnd.toDate(),
            available: false
          }
        })
      }
    }
  }

  const hmToString = (hm) => {
    if (!hm) return '0000'
    return `${String(hm.h || 0).padStart(2, '0')}${String(hm.m || 0).padStart(2, '0')}`
  }

  const navigateToDate = async (date) => {
    const path = `/${basePath}/${date.format('YYYY-MM-DD')}`
    history.replace(path)

    // Subscribe and wait for data to be ready
    const day = dateToDay(date)
    const appointmentsSub = subscribe('appointments-day', { ...day, calendarId })
    const schedulesSub = subscribe('schedules-day', { ...day, calendarId })

    try {
      await waitForSubscriptions([appointmentsSub, schedulesSub], 10000)
      log(`Loaded ${date.format('YYYY-MM-DD')}`)
    } catch (e) {
      log(`Warning: ${e.message} for ${date.format('YYYY-MM-DD')}`, 'warning')
    }

    // Small delay for UI to render
    await sleep(100)
  }

  const ensureAssigneeOnDay = async (userId) => {
    checkAborted()
    const day = {
      year: currentDate.year(),
      month: currentDate.month() + 1,
      day: currentDate.date()
    }

    const existing = Schedules.findOne({
      type: 'day',
      calendarId,
      'day.year': day.year,
      'day.month': day.month,
      'day.day': day.day
    })

    if (existing && existing.userIds && existing.userIds.includes(userId)) {
      return // Already on day
    }

    await Schedules.actions.addUserToDay.callPromise({
      calendarId,
      userId,
      day
    })
    log(`Added assignee to day`)
    await sleep(stepDelay())
  }

  const removeOverlappingOverrides = async (userId, start, end) => {
    checkAborted()
    const overlapping = Schedules.find({
      type: { $in: ['override', 'overlay'] },
      calendarId,
      userId,
      removed: { $ne: true },
      start: { $lt: end },
      end: { $gt: start }
    }).fetch()

    for (const schedule of overlapping) {
      await Schedules.actions.softRemove.callPromise({ scheduleId: schedule._id })
      log(`Removed existing override ${moment(schedule.start).format('HH:mm')}-${moment(schedule.end).format('HH:mm')}`)
      await sleep(stepDelay() / 2)
    }
  }

  const parseTime = (timeStr) => {
    const h = parseInt(timeStr.slice(0, 2))
    const m = parseInt(timeStr.slice(2, 4))
    return { h, m }
  }

  const timeToDate = (date, timeStr) => {
    const { h, m } = parseTime(timeStr)
    return date.clone().startOf('day').add(h, 'hours').add(m, 'minutes')
  }

  // DSL Functions
  const dsl = {
    // Date iteration
    doBetween: async (startStr, endStr, callback) => {
      const start = moment(startStr, 'YYYY-MM-DD')
      const end = moment(endStr, 'YYYY-MM-DD')

      if (!start.isValid() || !end.isValid()) {
        throw new Error(`Invalid date range: ${startStr} - ${endStr}`)
      }

      totalDays = end.diff(start, 'days') + 1
      processedDays = 0

      log(`Processing ${totalDays} days from ${startStr} to ${endStr}`)

      currentDate = start.clone()
      while (currentDate.isSameOrBefore(end, 'day')) {
        checkAborted()

        // Navigate to the current date in the calendar view
        await navigateToDate(currentDate)

        // Set up day-of-week predicates for current iteration
        const dayOfWeek = currentDate.isoWeekday()
        dsl.isMonday = dayOfWeek === 1
        dsl.isTuesday = dayOfWeek === 2
        dsl.isWednesday = dayOfWeek === 3
        dsl.isThursday = dayOfWeek === 4
        dsl.isFriday = dayOfWeek === 5
        dsl.isSaturday = dayOfWeek === 6
        dsl.isSunday = dayOfWeek === 7
        dsl.currentDate = currentDate.format('YYYY-MM-DD')
        dsl.dayOfWeek = dayOfWeek

        // Manual confirmation mode
        if (manualMode && requestConfirmation) {
          const dateStr = currentDate.format('YYYY-MM-DD (dddd)')
          const result = await requestConfirmation(dateStr)
          if (result === 'abort') {
            throw new Error('Aborted by user')
          }
          if (result === 'skip') {
            log(`Skipped ${currentDate.format('YYYY-MM-DD')}`, 'warning')
            processedDays++
            onProgress && onProgress({
              current: processedDays,
              total: totalDays,
              date: currentDate.format('YYYY-MM-DD')
            })
            currentDate.add(1, 'day')
            continue
          }
        }

        await callback()

        processedDays++
        onProgress && onProgress({
          current: processedDays,
          total: totalDays,
          date: currentDate.format('YYYY-MM-DD')
        })

        currentDate.add(1, 'day')
      }

      log(`Completed processing ${totalDays} days`, 'success')
    },

    // Date range check within loop
    isBetween: (startStr, endStr) => {
      const start = moment(startStr, 'YYYY-MM-DD')
      const end = moment(endStr, 'YYYY-MM-DD')
      return currentDate.isSameOrAfter(start, 'day') && currentDate.isSameOrBefore(end, 'day')
    },

    // Close a day for an assignee (create override for entire day)
    close: async (assigneeName, options = {}) => {
      checkAborted()
      const user = findAssigneeByName(assigneeName)
      const userName = Users.methods.fullNameWithTitle(user)

      await ensureAssigneeOnDay(user._id)

      // Use business hours or default 7:00-21:00
      const dayStart = timeToDate(currentDate, options.from || '0700')
      const dayEnd = timeToDate(currentDate, options.to || '2100')

      await removeOverlappingOverrides(user._id, dayStart.toDate(), dayEnd.toDate())

      const schedule = {
        type: 'override',
        calendarId,
        userId: user._id,
        start: dayStart.toDate(),
        end: dayEnd.toDate(),
        available: false,
        note: options.reason || 'Closed via DSL'
      }

      await Schedules.actions.insert.callPromise({ schedule })
      log(`Closed ${userName}`, 'success')
      await sleep(stepDelay())
    },

    // Open an assignee for appointments (block non-open times with overrides)
    open: async (assigneeName, options = {}) => {
      checkAborted()
      const user = findAssigneeByName(assigneeName)
      const userName = Users.methods.fullNameWithTitle(user)

      await ensureAssigneeOnDay(user._id)

      const weekday = currentDate.isoWeekday()
      const defaultSchedule = getDefaultSchedule(user._id, weekday)

      let fromTime = options.from
      let toTime = options.to

      if (!fromTime && defaultSchedule && defaultSchedule.from) {
        fromTime = `${String(defaultSchedule.from.h).padStart(2, '0')}${String(defaultSchedule.from.m).padStart(2, '0')}`
      }
      if (!toTime && defaultSchedule && defaultSchedule.to) {
        toTime = `${String(defaultSchedule.to.h).padStart(2, '0')}${String(defaultSchedule.to.m).padStart(2, '0')}`
      }

      fromTime = fromTime || '0800'
      toTime = toTime || '1800'

      const dayStart = timeToDate(currentDate, '0730')
      const dayEnd = timeToDate(currentDate, '2100')
      const openStart = timeToDate(currentDate, fromTime)
      const openEnd = timeToDate(currentDate, toTime)

      // Remove any overlapping schedules first
      await removeOverlappingOverrides(user._id, dayStart.toDate(), dayEnd.toDate())

      // Block time BEFORE open period
      if (openStart.isAfter(dayStart)) {
        await Schedules.actions.insert.callPromise({
          schedule: {
            type: 'override',
            calendarId,
            userId: user._id,
            start: dayStart.toDate(),
            end: openStart.toDate(),
            available: false,
            note: options.note
          }
        })
      }

      // Block time AFTER open period
      if (openEnd.isBefore(dayEnd)) {
        await Schedules.actions.insert.callPromise({
          schedule: {
            type: 'override',
            calendarId,
            userId: user._id,
            start: openEnd.toDate(),
            end: dayEnd.toDate(),
            available: false,
            note: options.note
          }
        })
      }

      log(`Opened ${userName} ${fromTime}-${toTime} (blocked before/after)`, 'success')
      await sleep(stepDelay())
    },

    // Open a day for an assignee by applying their default schedule as overrides
    openDay: async (assigneeName, options = {}) => {
      checkAborted()
      const user = findAssigneeByName(assigneeName)
      const userName = Users.methods.fullNameWithTitle(user)

      await ensureAssigneeOnDay(user._id)

      const weekday = currentDate.isoWeekday()
      const defaults = getAllDefaultSchedules(user._id, weekday)

      if (defaults.length === 0) {
        log(`No default schedule found for ${userName} on this weekday`, 'warning')
        return
      }

      // Remove all existing overrides for this user on this day
      const dayStart = timeToDate(currentDate, '0700').toDate()
      const dayEnd = timeToDate(currentDate, '2100').toDate()
      await removeOverlappingOverrides(user._id, dayStart, dayEnd)

      // Apply default schedule as overrides
      await applyDefaultScheduleOverrides(user._id, defaults)

      const availableCount = defaults.filter(d => d.available !== false).length
      log(`Applied ${availableCount} schedule block(s) for ${userName}`, 'success')
      await sleep(stepDelay())
    },

    // Open bookable slots for an assignee - uses the same timeSlots logic as the UI
    openBookable: async (assigneeName, options = {}) => {
      checkAborted()
      const user = findAssigneeByName(assigneeName)
      const userName = Users.methods.fullNameWithTitle(user)

      await ensureAssigneeOnDay(user._id)

      const weekday = currentDate.isoWeekday()
      const defaults = getAllDefaultSchedules(user._id, weekday)

      // Determine time ranges to create bookables
      let timeRanges = []

      if (options.from && options.to) {
        // Explicit time range provided - use open() to block before/after
        timeRanges = [{ from: options.from, to: options.to }]

        // Block non-open times using open() logic
        const dayStart = timeToDate(currentDate, '0730')
        const dayEnd = timeToDate(currentDate, '2100')
        const openStart = timeToDate(currentDate, options.from)
        const openEnd = timeToDate(currentDate, options.to)

        await removeOverlappingOverrides(user._id, dayStart.toDate(), dayEnd.toDate())

        if (openStart.isAfter(dayStart)) {
          await Schedules.actions.insert.callPromise({
            schedule: {
              type: 'override',
              calendarId,
              userId: user._id,
              start: dayStart.toDate(),
              end: openStart.toDate(),
              available: false
            }
          })
        }
        if (openEnd.isBefore(dayEnd)) {
          await Schedules.actions.insert.callPromise({
            schedule: {
              type: 'override',
              calendarId,
              userId: user._id,
              start: openEnd.toDate(),
              end: dayEnd.toDate(),
              available: false
            }
          })
        }
      } else if (defaults.length > 0) {
        // Use available blocks from default schedule
        const availableDefaults = defaults.filter(d => d.available !== false)
        timeRanges = availableDefaults.map(d => ({
          from: hmToString(d.from),
          to: hmToString(d.to)
        }))

        // Remove existing overrides and apply defaults (blocks before/after/between)
        const dayStart = timeToDate(currentDate, '0700').toDate()
        const dayEnd = timeToDate(currentDate, '2100').toDate()
        await removeOverlappingOverrides(user._id, dayStart, dayEnd)
        await applyDefaultScheduleOverrides(user._id, defaults)
      } else {
        // Fallback to 08:00-18:00 - block outside these times
        timeRanges = [{ from: '0800', to: '1800' }]

        const dayStart = timeToDate(currentDate, '0730')
        const dayEnd = timeToDate(currentDate, '2100')
        const openStart = timeToDate(currentDate, '0800')
        const openEnd = timeToDate(currentDate, '1800')

        await removeOverlappingOverrides(user._id, dayStart.toDate(), dayEnd.toDate())

        await Schedules.actions.insert.callPromise({
          schedule: {
            type: 'override',
            calendarId,
            userId: user._id,
            start: dayStart.toDate(),
            end: openStart.toDate(),
            available: false
          }
        })
        await Schedules.actions.insert.callPromise({
          schedule: {
            type: 'override',
            calendarId,
            userId: user._id,
            start: openEnd.toDate(),
            end: dayEnd.toDate(),
            available: false
          }
        })
      }

      if (timeRanges.length === 0) {
        log(`No available time ranges for ${userName}`, 'warning')
        return
      }

      // Get slot configuration from calendar - same logic as blanks.js
      const slotSize = (calendar && calendar.slotSize) || 5
      const slotSizeAppointment = (calendar && calendar.slotSizeAppointment) || slotSize
      const atMinutes = calendar && calendar.atMinutes

      // Day boundaries for schedule queries
      const dayStartQuery = timeToDate(currentDate, '0700').toDate()
      const dayEndQuery = timeToDate(currentDate, '2100').toDate()

      // Get the user's schedules to determine offset (same as blanks.js)
      const userSchedules = Schedules.find({
        calendarId,
        userId: user._id,
        $or: [
          { type: 'override', start: { $gte: dayStartQuery }, end: { $lte: dayEndQuery } },
          { type: 'overlay', start: { $gte: dayStartQuery }, end: { $lte: dayEndQuery } }
        ]
      }).fetch()

      const scheduleOffset = slotSizeAppointment &&
        (userSchedules && userSchedules.length >= 1) &&
        moment(sortBy(userSchedules, 'end')[0].end).add(1, 'second').minute()

      const slotSizeBlank = (scheduleOffset === 0 || scheduleOffset > 0)
        ? slotSizeAppointment
        : slotSize

      // Get all valid time slots using the same function as the UI
      const allSlots = timeSlots(slotSizeBlank, scheduleOffset, atMinutes)

      // Get existing appointments that block slots
      const existingAppointments = Appointments.find({
        calendarId,
        assigneeId: user._id,
        start: { $gte: dayStartQuery },
        end: { $lte: dayEndQuery },
        removed: { $ne: true },
        canceled: { $ne: true }
      }).fetch()

      // Helper to check if a slot is blocked
      const isSlotBlocked = (slotStart, slotEnd) => {
        for (const appt of existingAppointments) {
          if (appt.type === 'bookable') continue
          if (slotStart < appt.end && slotEnd > appt.start) {
            return true
          }
        }
        return false
      }

      // Helper to check if a time label is within any of our time ranges
      const isInTimeRange = (slotLabel) => {
        // slotLabel is like "T0815" - extract hour and minute
        const h = parseInt(slotLabel.substr(1, 2))
        const m = parseInt(slotLabel.substr(3, 2))
        const slotMinutes = h * 60 + m

        for (const range of timeRanges) {
          const fromH = parseInt(range.from.substr(0, 2))
          const fromM = parseInt(range.from.substr(2, 2))
          const toH = parseInt(range.to.substr(0, 2))
          const toM = parseInt(range.to.substr(2, 2))
          const fromMinutes = fromH * 60 + fromM
          const toMinutes = toH * 60 + toM

          if (slotMinutes >= fromMinutes && slotMinutes < toMinutes) {
            return true
          }
        }
        return false
      }

      // Create bookables for valid slots within time ranges
      let totalCreated = 0

      for (let i = 0; i < allSlots.length - 1; i++) {
        checkAborted()

        const slotLabel = allSlots[i]
        const nextSlotLabel = allSlots[i + 1]

        if (!isInTimeRange(slotLabel)) continue

        // Use setTime to convert slot labels to actual dates
        const slotStart = setTime(slotLabel)(currentDate.clone()).toDate()
        const slotEnd = setTime(nextSlotLabel)(currentDate.clone()).toDate()

        if (!isSlotBlocked(slotStart, slotEnd)) {
          await Appointments.actions.setBookable.callPromise({
            calendarId,
            start: slotStart,
            end: slotEnd,
            assigneeId: user._id
          })
          totalCreated++
        }
      }

      const rangeStr = timeRanges.map(r => `${r.from}-${r.to}`).join(', ')
      const atMinutesStr = atMinutes ? ` at :${atMinutes.join('/:')})` : ''
      if (totalCreated > 0) {
        log(`Created ${totalCreated} bookable slot(s) for ${userName} (${rangeStr}${atMinutesStr})`, 'success')
      } else {
        log(`No bookable slots created for ${userName} (all blocked)`, 'warning')
      }
      await sleep(stepDelay())
    },

    // Remove bookable slots
    closeBookable: async (assigneeName) => {
      checkAborted()
      const user = findAssigneeByName(assigneeName)
      const userName = Users.methods.fullNameWithTitle(user)

      const dayStart = currentDate.clone().startOf('day')
      const dayEnd = currentDate.clone().endOf('day')

      const bookables = Appointments.find({
        type: 'bookable',
        calendarId,
        assigneeId: user._id,
        start: { $gte: dayStart.toDate() },
        end: { $lte: dayEnd.toDate() },
        removed: { $ne: true }
      }).fetch()

      for (const bookable of bookables) {
        await Appointments.actions.unsetBookable.callPromise({
          bookableId: bookable._id
        })
        await sleep(stepDelay() / 2)
      }

      if (bookables.length > 0) {
        log(`Removed ${bookables.length} bookable(s) for ${userName}`, 'success')
      }
    },

    // Skip Sundays helper
    skipSundays: () => {
      return currentDate.isoWeekday() !== 7
    },

    // Day predicates (set dynamically in doBetween)
    isMonday: false,
    isTuesday: false,
    isWednesday: false,
    isThursday: false,
    isFriday: false,
    isSaturday: false,
    isSunday: false,
    currentDate: null,
    dayOfWeek: null
  }

  return dsl
}

export const executeDSL = async (code, context) => {
  const dsl = createDSLContext(context)

  // Wrap DSL functions to use current context values (getters for day predicates)
  const getIsMonday = () => dsl.isMonday
  const getIsTuesday = () => dsl.isTuesday
  const getIsWednesday = () => dsl.isWednesday
  const getIsThursday = () => dsl.isThursday
  const getIsFriday = () => dsl.isFriday
  const getIsSaturday = () => dsl.isSaturday
  const getIsSunday = () => dsl.isSunday
  const getCurrentDate = () => dsl.currentDate
  const getDayOfWeek = () => dsl.dayOfWeek

  // Rewrite the code to use function calls for day predicates
  const wrappedCode = code
    .replace(/\bisMonday\b(?!\s*[:(])/g, 'isMonday()')
    .replace(/\bisTuesday\b(?!\s*[:(])/g, 'isTuesday()')
    .replace(/\bisWednesday\b(?!\s*[:(])/g, 'isWednesday()')
    .replace(/\bisThursday\b(?!\s*[:(])/g, 'isThursday()')
    .replace(/\bisFriday\b(?!\s*[:(])/g, 'isFriday()')
    .replace(/\bisSaturday\b(?!\s*[:(])/g, 'isSaturday()')
    .replace(/\bisSunday\b(?!\s*[:(])/g, 'isSunday()')
    .replace(/\bcurrentDate\b(?!\s*[:(])/g, 'currentDate()')
    .replace(/\bdayOfWeek\b(?!\s*[:(])/g, 'dayOfWeek()')

  const wrappedFn = new Function(
    'doBetween', 'isBetween', 'close', 'open', 'openDay', 'openBookable', 'closeBookable', 'skipSundays',
    'isMonday', 'isTuesday', 'isWednesday', 'isThursday', 'isFriday', 'isSaturday', 'isSunday',
    'currentDate', 'dayOfWeek',
    `return (async () => { ${wrappedCode} })()`
  )

  return wrappedFn(
    dsl.doBetween,
    dsl.isBetween,
    dsl.close,
    dsl.open,
    dsl.openDay,
    dsl.openBookable,
    dsl.closeBookable,
    dsl.skipSundays,
    getIsMonday,
    getIsTuesday,
    getIsWednesday,
    getIsThursday,
    getIsFriday,
    getIsSaturday,
    getIsSunday,
    getCurrentDate,
    getDayOfWeek
  )
}
