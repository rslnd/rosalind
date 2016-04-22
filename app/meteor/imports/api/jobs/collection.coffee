{ JobCollection } = require 'meteor/vsivsi:job-collection'

options = (options) ->
  idGeneration: 'MONGO'
  transform: (doc) ->
    try
      job = new Job(Jobs[options.jobs], doc)
    catch e
      job = doc
    return job

Jobs =
  import: new JobCollection('import', options(jobs: 'import'))
  cache: new JobCollection('cache', options(jobs: 'cache'))


module.exports = Jobs
