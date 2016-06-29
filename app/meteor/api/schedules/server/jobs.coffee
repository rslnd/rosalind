Schedules = require '../collection'
{ Cache } = require 'api/cache'

module.exports = ->
  Job.processJobs 'cache', 'schedules', (job, callback) ->

    date = moment(job.data?.date)

    job.log("[Schedules] Caching #{date.toDate()}")


    cache = Schedules.methods.cache(date)

    if _id = Cache.findOne({ day: cache.day })?._id
      Cache.update(_id, { $set: cache })
    else
      Cache.insert(cache)

    console.log('[Schedules] Cached')

    job.done() and callback()
