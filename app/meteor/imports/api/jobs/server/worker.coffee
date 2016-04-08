Jobs = require '../collection'

module.exports = ->
  Jobs.Import.startJobServer()
  Jobs.Cache.startJobServer()
