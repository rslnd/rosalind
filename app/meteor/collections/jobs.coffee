@Jobs = {}
@later = {}

setup = ->
  Jobs.Import = new JobCollection('import', getOptions(jobs: 'Import'))
  later = Jobs.Import.later

getOptions = (options) ->
  idGeneration: 'MONGO'
  transform: (doc) ->
    try
      job = new Job(Jobs[options.jobs], doc)
    catch e
      job = doc
    return job

setup()
