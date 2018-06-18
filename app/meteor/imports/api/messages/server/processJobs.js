import { Meteor } from 'meteor/meteor'
import { Messages } from '../'
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

  Meteor.setTimeout(() => {
    Messages.jobs.startJobServer()
    Messages.jobs.processJobs('appointmentReminder', options, worker)
  }, process.env.NODE_ENV === 'production' ? 60 * 1000 : 1000)
}
