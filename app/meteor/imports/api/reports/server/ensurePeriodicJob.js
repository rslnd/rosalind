import { Job } from 'meteor/strigops:job-collection'
import { Reports } from '../'

// The job polls every 15 minutes; the worker only sends once the day is
// finished (see dayFinished.js). The window covers 12:00-22:59 Vienna time in
// both summer (UTC+2) and winter time (UTC+1), the worker checks the exact local
// hour, so a daylight saving change needs no restart.
const pollHoursUTC = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
const pollMinutes = [0, 15, 30, 45]

export const ensurePeriodicJob = () => {
  // Later.js schedule format
  const schedule = {
    schedules: [
      { h: pollHoursUTC, m: pollMinutes }
    ]
  }

  console.log('[Reports] Checking every 15 minutes (12:00-22:00 Vienna time) whether the day is finished to send the daily report')

  new Job(Reports.jobs, 'dailyReport', {})
    .repeat({
      schedule,
      repeats: Job.forever,
      until: Job.foreverDate
    })
    .retry({
      retries: 3,
      wait: 30 * 60 * 1000,
      backoff: 'exponential'
    })
    .save({
      cancelRepeats: true
    })
    .catch(e => console.error('[Reports] Failed to save periodic job', e))
}
