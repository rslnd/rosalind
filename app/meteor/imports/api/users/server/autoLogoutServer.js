import moment from 'moment-timezone'
import { JobCollection, Job } from 'meteor/strigops:job-collection'
import { Users } from '../'

const removeSessionTokens = async () => {
  await Users.updateAsync(
    {},
    { $unset: { 'services.resume.loginTokens': 1 }},
    { multi: true })
}

export default () => {
  const sendAtHourLocal = 3
  const sendAtHourUTC = moment().tz('Europe/Vienna').hour(sendAtHourLocal).startOf('hour').utc().hours()

  const everyNight = { h: [sendAtHourUTC], m: [0] }

  // Later.js schedule format
  const schedule = {
    schedules: [
      everyNight
    ]
  }

  const jobs = new JobCollection('autoLogoutServer', {
    transform: (doc) => {
      let j
      try {
        j = new Job(jobs, doc)
      } catch (e) {
        j = doc
      }
      return j
    }
  })

  const cleanOldJobs = async (job) => {
    const ids = await jobs.find({
      status: { $in: Job.jobStatusRemovable },
      updated: { $lt: moment().subtract(7, 'days').toDate() }
    }, { fields: { _id: 1 } }).mapAsync(d => d._id)

    if (ids.length > 0) {
      await jobs.removeJobs(ids)
    }
  }

  new Job(jobs, 'autoLogoutServer', {})
    .repeat({
      schedule,
      repeats: Job.forever,
      until: Job.foreverDate
    })
    .retry({
      retries: 2,
      wait: 60 * 1000,
      backoff: 'exponential'
    })
    .save({
      cancelRepeats: true
    })
    .catch(e => console.error('[Users] autoLogoutServer: failed to save periodic job', e))

  const worker = (job, callback) => {
    console.log('[Users] autoLogoutServer: Running job')
    try {
      removeSessionTokens()
        .then(async () => {
          await cleanOldJobs(job).catch(e => console.error('[Users] autoLogoutServer: failed to clean old jobs', e))
          await job.done()
          callback()
        }).catch(async (e) => {
          console.error('[Users] autoLogoutServer: errored with', e)
          await job.fail().catch(e => console.error('[Users] autoLogoutServer: failed to mark job as failed', e))
        })
    } catch (e) {
      console.error('[Users] autoLogoutServer: hard errored with', e)
    }
  }


  const processJobs = () => {
    const options = {
      workTimeout: 2 * 60 * 1000,
      callbackStrict: true
    }
  
    Reports.jobs.events.on('error', (msg) => {
      console.error('[Users] autoLogoutServer: Error', msg)
    })
  
    Reports.jobs.events.on('jobLog', (msg) => {
      console.log('[Users] autoLogoutServer:', msg.params[2])
    })

    Meteor.setTimeout(() => {
      if (process.env.PROCESS_JOBS === '1') {
        jobs.startJobServer()
          .catch(e => console.error('[Users] autoLogoutServer: failed to start job server', e))
        jobs.processJobs('autoLogoutServer', options, worker)
      }
    }, process.env.NODE_ENV === 'production' ? 60 * 1000 : 1000)
  }
}