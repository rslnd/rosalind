Schedules = require '../collection'

module.exports = ->
  Job.processJobs 'Cache', 'schedules', (job, callback) ->

    job.log('Cache: Schedules: Running')

    Schedules.methods.updateCache()

    job.log('Cache: Schedules: Done')

    job.done() and callback()
