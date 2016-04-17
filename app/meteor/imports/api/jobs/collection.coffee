{ JobCollection } = require 'meteor/vsivsi:job-collection'

options = (options) ->
  idGeneration: 'MONGO'
  transform: (doc) ->
    try
      job = new Job(Jobs[options.jobs], doc)
    catch e
      job = doc
    return job

module.exports =
  Import: new JobCollection('import', options(jobs: 'import'))
  Cache: new JobCollection('cache', options(jobs: 'cache'))
