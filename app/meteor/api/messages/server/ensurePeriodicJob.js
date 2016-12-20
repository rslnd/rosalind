import { Job } from 'meteor/vsivsi:job-collection'
import { Messages } from 'api/messages'

export const ensurePeriodicJob = () => {
  new Job(Messages.jobs, 'appointmentReminder', {})
    .repeat({
      repeats: Job.forever,
      until: Job.foreverDate,
      wait: 5 * 1000
    })
    .retry({
      wait: 10 * 1000
    })
    .save({
      cancelRepeats: true
    })
}
