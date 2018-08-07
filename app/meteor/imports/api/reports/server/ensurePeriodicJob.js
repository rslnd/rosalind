import moment from 'moment-timezone'
import { Job } from 'meteor/simonsimcity:job-collection'
import { Reports } from '../'

export const ensurePeriodicJob = () => {
  const sendAtHourLocal = 21
  const sendAtHourUTC = moment().tz('Europe/Vienna').hour(sendAtHourLocal).startOf('hour').utc().hours()

  const everyNight = {h: [sendAtHourUTC], m: [0] }

  // Later.js schedule format
  const schedule = {
    schedules: [
      everyNight
    ]
  }

  console.log(`[Reports] Sending daily report at local time ${sendAtHourLocal}:00 (UTC ${sendAtHourUTC}:00)`)

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
}
