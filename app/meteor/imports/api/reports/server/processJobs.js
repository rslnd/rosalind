import { Meteor } from 'meteor/meteor'
import { Reports } from '../'
import { dailyReportWorker } from './dailyReportWorker'

export const processJobs = () => {
  const options = {
    workTimeout: 2 * 60 * 1000,
    callbackStrict: true
  }

  Reports.jobs.events.on('error', (msg) => {
    console.error('[Reports] Job: Error', msg)
  })

  Reports.jobs.events.on('jobLog', (msg) => {
    console.log('[Reports] Job:', msg.params[2])
  })

  Meteor.setTimeout(() => {
    if (process.env.PROCESS_JOBS === '1') {
      Reports.jobs.startJobServer()
      Reports.jobs.processJobs('dailyReport', options, dailyReportWorker)
    }
  }, process.env.NODE_ENV === 'production' ? 60 * 1000 : 1000)
}
