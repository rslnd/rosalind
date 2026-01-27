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

// Day boundaries - match server-side transformDefaultsToOverrides.js
const DAY_START_TIME = '0730'
const DAY_END_TIME = '2100'

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
      const start = timeToDate(currentDate, hmToString(d.from)).toDate()
      const end = timeToDate(currentDate, hmToString(d.to)).toDate()
      await insertBlockingOverride(userId, start, end, d.note || 'Pause')
    }

    // Create override blocks for times outside available periods
    if (availableDefaults.length > 0) {
      const dayStart = timeToDate(currentDate, DAY_START_TIME)
      const dayEnd = timeToDate(currentDate, DAY_END_TIME)

      // Sort by start time
      const sorted = availableDefaults.sort((a, b) => {
        const aTime = a.from.h * 60 + a.from.m
        const bTime = b.from.h * 60 + b.from.m
        return aTime - bTime
      })

      // Block before first available
      const firstStart = timeToDate(currentDate, hmToString(sorted[0].from))
      if (firstStart.isAfter(dayStart)) {
        await insertBlockingOverride(userId, dayStart.toDate(), firstStart.toDate())
      }

      // Block between available periods
      for (let i = 0; i < sorted.length - 1; i++) {
        const currEnd = timeToDate(currentDate, hmToString(sorted[i].to))
        const nextStart = timeToDate(currentDate, hmToString(sorted[i + 1].from))

        if (currEnd.isBefore(nextStart)) {
          await insertBlockingOverride(userId, currEnd.toDate(), nextStart.toDate(), 'Break')
        }
      }

      // Block after last available
      const lastEnd = timeToDate(currentDate, hmToString(sorted[sorted.length - 1].to))
      if (lastEnd.isBefore(dayEnd)) {
        await insertBlockingOverride(userId, lastEnd.toDate(), dayEnd.toDate())
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

  // Remove bookables that overlap with a time range (when creating blocking overrides)
  const removeOverlappingBookables = async (userId, start, end) => {
    checkAborted()
    const overlapping = Appointments.find({
      type: 'bookable',
      calendarId,
      assigneeId: userId,
      removed: { $ne: true },
      start: { $lt: end },
      end: { $gt: start }
    }).fetch()

    for (const bookable of overlapping) {
      await Appointments.actions.unsetBookable.callPromise({ bookableId: bookable._id })
    }

    if (overlapping.length > 0) {
      log(`Removed ${overlapping.length} bookable(s) in blocked time range`)
    }
  }

  // Helper to insert an override and clean up bookables in that range
  const insertBlockingOverride = async (userId, start, end, note) => {
    // First remove any bookables in this range
    await removeOverlappingBookables(userId, start, end)

    // Then create the override
    await Schedules.actions.insert.callPromise({
      schedule: {
        type: 'override',
        calendarId,
        userId,
        start,
        end,
        available: false,
        note
      }
    })
  }

  // Get existing overrides for a user on current day to find available time slots
  const getExistingOverrides = (userId) => {
    const dayStart = timeToDate(currentDate, DAY_START_TIME).toDate()
    const dayEnd = timeToDate(currentDate, DAY_END_TIME).toDate()

    return Schedules.find({
      type: { $in: ['override', 'overlay'] },
      calendarId,
      userId,
      removed: { $ne: true },
      start: { $gte: dayStart },
      end: { $lte: dayEnd }
    }, { sort: { start: 1 } }).fetch()
  }

  // Find available time ranges from existing overrides (gaps where available or no override)
  const findAvailableRangesFromOverrides = (userId) => {
    const overrides = getExistingOverrides(userId)
    const dayStart = timeToDate(currentDate, DAY_START_TIME)
    const dayEnd = timeToDate(currentDate, DAY_END_TIME)

    if (overrides.length === 0) {
      // No overrides - no available time (don't assume anything)
      return []
    }

    const availableRanges = []

    // Check for available overlays (positive availability)
    const availableOverlays = overrides.filter(o => o.type === 'overlay' || o.available === true)
    for (const overlay of availableOverlays) {
      availableRanges.push({
        from: moment(overlay.start).format('HHmm'),
        to: moment(overlay.end).format('HHmm')
      })
    }

    // If we have available overlays, use those
    if (availableRanges.length > 0) {
      return availableRanges
    }

    // Otherwise, find gaps between unavailable overrides
    const unavailableOverrides = overrides.filter(o => o.available === false)
    if (unavailableOverrides.length === 0) {
      return [] // No info, don't assume
    }

    // Sort by start time
    const sorted = unavailableOverrides.sort((a, b) => a.start - b.start)

    // Check gap before first override
    const firstStart = moment(sorted[0].start)
    if (firstStart.isAfter(dayStart)) {
      availableRanges.push({
        from: dayStart.format('HHmm'),
        to: firstStart.format('HHmm')
      })
    }

    // Check gaps between overrides
    for (let i = 0; i < sorted.length - 1; i++) {
      const currEnd = moment(sorted[i].end)
      const nextStart = moment(sorted[i + 1].start)
      if (currEnd.isBefore(nextStart)) {
        availableRanges.push({
          from: currEnd.format('HHmm'),
          to: nextStart.format('HHmm')
        })
      }
    }

    // Check gap after last override
    const lastEnd = moment(sorted[sorted.length - 1].end)
    if (lastEnd.isBefore(dayEnd)) {
      availableRanges.push({
        from: lastEnd.format('HHmm'),
        to: dayEnd.format('HHmm')
      })
    }

    return availableRanges
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

      // Use provided times or day boundaries
      const dayStart = timeToDate(currentDate, options.from || DAY_START_TIME)
      const dayEnd = timeToDate(currentDate, options.to || DAY_END_TIME)

      await removeOverlappingOverrides(user._id, dayStart.toDate(), dayEnd.toDate())

      // Use helper that also removes bookables in the blocked range
      await insertBlockingOverride(user._id, dayStart.toDate(), dayEnd.toDate(), options.reason || 'Closed via DSL')
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

      const dayStart = timeToDate(currentDate, DAY_START_TIME)
      const dayEnd = timeToDate(currentDate, DAY_END_TIME)
      const openStart = timeToDate(currentDate, fromTime)
      const openEnd = timeToDate(currentDate, toTime)

      // Remove any overlapping schedules first
      await removeOverlappingOverrides(user._id, dayStart.toDate(), dayEnd.toDate())

      // Block time BEFORE open period
      if (openStart.isAfter(dayStart)) {
        await insertBlockingOverride(user._id, dayStart.toDate(), openStart.toDate(), options.note)
      }

      // Block time AFTER open period
      if (openEnd.isBefore(dayEnd)) {
        await insertBlockingOverride(user._id, openEnd.toDate(), dayEnd.toDate(), options.note)
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
      const dayStart = timeToDate(currentDate, DAY_START_TIME).toDate()
      const dayEnd = timeToDate(currentDate, DAY_END_TIME).toDate()
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
        const dayStart = timeToDate(currentDate, DAY_START_TIME)
        const dayEnd = timeToDate(currentDate, DAY_END_TIME)
        const openStart = timeToDate(currentDate, options.from)
        const openEnd = timeToDate(currentDate, options.to)

        await removeOverlappingOverrides(user._id, dayStart.toDate(), dayEnd.toDate())

        if (openStart.isAfter(dayStart)) {
          await insertBlockingOverride(user._id, dayStart.toDate(), openStart.toDate())
        }
        if (openEnd.isBefore(dayEnd)) {
          await insertBlockingOverride(user._id, openEnd.toDate(), dayEnd.toDate())
        }
      } else if (defaults.length > 0) {
        // Use available blocks from default schedule
        const availableDefaults = defaults.filter(d => d.available !== false)
        timeRanges = availableDefaults.map(d => ({
          from: hmToString(d.from),
          to: hmToString(d.to)
        }))

        // Remove existing overrides and apply defaults (blocks before/after/between)
        const dayStart = timeToDate(currentDate, DAY_START_TIME).toDate()
        const dayEnd = timeToDate(currentDate, DAY_END_TIME).toDate()
        await removeOverlappingOverrides(user._id, dayStart, dayEnd)
        await applyDefaultScheduleOverrides(user._id, defaults)
      } else {
        // No default schedule - look at existing overrides to find available slots
        // Don't assume availability, only fill in gaps from existing manual overrides
        timeRanges = findAvailableRangesFromOverrides(user._id)

        if (timeRanges.length === 0) {
          log(`No default schedule and no available time found in existing overrides for ${userName}`, 'warning')
          return
        }

        log(`Using ${timeRanges.length} available range(s) from existing overrides`)
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
      const dayStartQuery = timeToDate(currentDate, DAY_START_TIME).toDate()
      const dayEndQuery = timeToDate(currentDate, DAY_END_TIME).toDate()

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
