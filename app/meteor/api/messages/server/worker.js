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
    job.log(`Removed ${ids.length} old jobs`)
  }
}

export const worker = (job, callback) => {
  Messages.actions.createReminders.call()

  cleanOldJobs(job)
  job.done()
  callback()
}
