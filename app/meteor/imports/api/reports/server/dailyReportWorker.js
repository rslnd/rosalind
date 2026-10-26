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
    Reports.jobs.removeJobs(ids)
  }
}

export const dailyReportWorker = (job, callback) => {
  console.log('[Reports] dailyReportWorker: Sending email')
  try {
    sendEmail()
      .then(() => {
        console.log('[Reports] worker: job done')
        cleanOldJobs(job)
        job.done()
        callback()
      }).catch((e) => {
        console.error('[Reports] worker: errored with', e)
        job.fail()
      })
  } catch (e) {
    console.error('[Reports] worker: hard errored with', e)
  }
}
