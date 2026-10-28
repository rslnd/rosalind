import moment from 'moment-timezone'
import { Job } from 'meteor/strigops:job-collection'
import { Messages } from '../'

const cleanOldJobs = async (job) => {
  const ids = await Messages.jobs.find({
    status: { $in: Job.jobStatusRemovable },
    updated: { $lt: moment().subtract(1, 'day').toDate() }
  }, { fields: { _id: 1 } }).mapAsync(d => d._id)

  if (ids.length > 0) {
    await Messages.jobs.removeJobs(ids)
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

        await cleanOldJobs(job).catch(e => console.error('[Messages] worker: failed to clean old jobs', e))
        await job.done()
      }).catch(async (e) => {
        console.error('[Messages] worker: failed permanently with', e)
        await job.fail().catch(e => console.error('[Messages] worker: failed to mark job as failed', e))
      })
      // Always release the queue slot, otherwise processJobs stops picking up jobs after a failure
      .finally(() => callback())
  } catch (e) {
    console.error('[Messages] worker: hard errored with', e)
    callback()
  }
}
