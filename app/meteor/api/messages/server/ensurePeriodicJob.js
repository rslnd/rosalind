import { Job } from 'meteor/vsivsi:job-collection'
import { Messages } from 'api/messages'

export const ensurePeriodicJob = () => {
  new Job(Messages.jobs, 'appointmentReminder', {})
    .repeat({
      repeats: Job.forever,
      until: Job.foreverDate,
      wait: 60 * 1000
    })
    .retry({
      retries: Job.forever,
      wait: 120 * 1000,
      backoff: 'exponential'
    })
    .save({
      cancelRepeats: true
    })
}
