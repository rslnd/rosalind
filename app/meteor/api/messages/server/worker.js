import moment from 'moment'
import { Job } from 'meteor/vsivsi:job-collection'
import { Messages } from 'api/messages'

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
  // We can't check for quiet time here, because doing so would
  // postpone the cancelation confirmation until next morning
  // when a patient wants to cancel her appointment at night
  Messages.actions.createReminders.callPromise()
    .then(() => Messages.actions.sendScheduled.callPromise())
    .then(() => {
      cleanOldJobs(job)
      job.done()
      callback()
    }).catch((e) => {
      console.error('[Messages] worker: errored with', e)
      job.fail()
    })
}
