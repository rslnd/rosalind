{ terminiko } = require './terminiko'

module.exports = ->
  Job.processJobs 'import', 'terminiko', terminiko
