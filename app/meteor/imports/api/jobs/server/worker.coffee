Jobs = require '../collection'

module.exports = ->
  Jobs.import.startJobServer()
  Jobs.cache.startJobServer()
