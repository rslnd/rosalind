import once from 'lodash/once'
import moment from 'moment'
import { Job } from 'meteor/vsivsi:job-collection'
import { Messages } from 'api/messages'

const hello = once(() => {
  console.log('[Messages] worker: running')
})

const cleanOldJobs = (job) => {
  const ids = Messages.jobs.find({
    status: { $in: Job.jobStatusRemovable },
    updated: { $lt: moment().subtract(1, 'day').toDate() }
  }, { fields: { _id: 1 } }).map(d => d._id)

  if (ids.length > 0) {
    Messages.jobs.removeJobs(ids)
  }
}

export const worker = (job, callback) => {
  hello()

  Promise.all([
    Messages.actions.createReminders.callPromise(),
    Messages.actions.sendScheduled.callPromise()
  ]).catch((e) => {
    console.error('[Messages] worker: errored with', e)
    setTimeout(() => job.fail(), 5000)
  }).then(() => {
    cleanOldJobs(job)
    job.done()
    callback()
  })
}
