import moment from 'moment-timezone'
import { Job } from 'meteor/strigops:job-collection'
import { Reports } from '../'
import { Appointments } from '../../appointments'
import { Calendars } from '../../calendars'
import { Schedules } from '../../schedules'
import { Events } from '../../events'
import { Users } from '../../users'
import { dayToDate } from '../../../util/time/day'
import { computeStatistics } from '../methods/computeStatistics'
import { TIMEZONE, CUTOFF_HOUR, sendAt } from '../methods/dayFinished'
import { sendEmail } from './methods'

const POLL_FROM_HOUR = 12

const cleanOldJobs = async (job) => {
  const ids = await Reports.jobs.find({
    status: { $in: Job.jobStatusRemovable },
    updated: { $lt: moment().subtract(1, 'day').toDate() }
  }, { fields: { _id: 1 } }).mapAsync(d => d._id)

  if (ids.length > 0) {
    await Reports.jobs.removeJobs(ids)
  }
}

// Sends today's report once the last patient is processed (a few minutes later,
// to mark the last no-shows), at the latest at the hard end of the day.
export const sendIfReady = async () => {
  const nowLocal = moment().tz(TIMEZONE)
  if (nowLocal.hour() < POLL_FROM_HOUR || nowLocal.hour() > CUTOFF_HOUR) {
    return
  }

  const day = { year: nowLocal.year(), month: nowLocal.month() + 1, day: nowLocal.date() }

  // Test mails do not count as sent (outside of production every mail is a test)
  const alreadySent = await Events.findOneAsync({
    type: 'reports/sendEmail',
    'payload.day.year': day.year,
    'payload.day.month': day.month,
    'payload.day.day': day.day,
    ...(process.env.NODE_ENV === 'production' ? { 'payload.test': { $ne: true } } : {})
  })

  if (alreadySent) {
    return
  }

  const asOf = moment(dayToDate(day)).endOf('day').toDate()
  const statistics = await computeStatistics({ Appointments, Schedules, Calendars, Users, asOf })
  const readyAt = sendAt(statistics)

  if (Date.now() < readyAt) {
    console.log('[Reports] dailyReportWorker: Day not finished yet, waiting until', new Date(readyAt).toISOString())
    return
  }

  console.log(`[Reports] dailyReportWorker: Day finished (${statistics.finishedReason}), sending email`)
  await sendEmail({ day })
}

export const dailyReportWorker = (job, callback) => {
  try {
    sendIfReady()
      .then(async () => {
        console.log('[Reports] worker: job done')
        await cleanOldJobs(job).catch(e => console.error('[Reports] worker: failed to clean old jobs', e))
        await job.done()
      }).catch(async (e) => {
        console.error('[Reports] worker: errored with', e)
        await job.fail().catch(e => console.error('[Reports] worker: failed to mark job as failed', e))
      })
      // Always release the queue slot, otherwise processJobs stops picking up jobs after a failure
      .finally(() => callback())
  } catch (e) {
    console.error('[Reports] worker: hard errored with', e)
    callback()
  }
}
