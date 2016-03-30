{ JobCollection } = require 'vsivsi:job-collection'

options = (options) ->
  idGeneration: 'MONGO'
  transform: (doc) ->
    try
      job = new Job(Jobs[options.jobs], doc)
    catch e
      job = doc
    return job

module.exports =
  Import: new JobCollection('Import', options(jobs: 'Import'))
