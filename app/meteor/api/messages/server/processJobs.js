import { Messages } from 'api/messages'
import { worker } from './worker'

export const processJobs = () => {
  const options = {
    workTimeout: 60 * 1000,
    callbackStrict: true
  }

  Messages.jobs.events.on('error', (msg) => {
    console.error('[Messages] Job: Error', msg)
  })

  Messages.jobs.events.on('jobLog', (msg) => {
    console.log('[Messages] Job:', msg.params[2])
  })

  Messages.jobs.startJobServer()
  Messages.jobs.processJobs('appointmentReminder', options, worker)
}
