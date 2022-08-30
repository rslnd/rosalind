import moment from 'moment-timezone'
import { Job } from 'meteor/simonsimcity:job-collection'
import { Messages } from '../'

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
  try {
    Messages.actions.createReminders.callPromise()
      .then(async () => {
        try {
          await Messages.actions.sendScheduled.callPromise()
        } catch (e) {
          console.error('[Messages] worker: failed temporarily with', e)
        }

        cleanOldJobs(job)
        job.done()
        callback()
      }).catch((e) => {
        console.error('[Messages] worker: failed permanently with', e)
        job.fail()
      })
  } catch (e) {
    console.error('[Messages] worker: hard errored with', e)
  }
}
