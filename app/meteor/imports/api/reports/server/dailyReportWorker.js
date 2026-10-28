import moment from 'moment-timezone'
import { Job } from 'meteor/strigops:job-collection'
import { Reports } from '../'
import { sendEmail } from './methods'

const cleanOldJobs = async (job) => {
  const ids = await Reports.jobs.find({
    status: { $in: Job.jobStatusRemovable },
    updated: { $lt: moment().subtract(1, 'day').toDate() }
  }, { fields: { _id: 1 } }).mapAsync(d => d._id)

  if (ids.length > 0) {
    await Reports.jobs.removeJobs(ids)
  }
}

export const dailyReportWorker = (job, callback) => {
  console.log('[Reports] dailyReportWorker: Sending email')
  try {
    sendEmail()
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
