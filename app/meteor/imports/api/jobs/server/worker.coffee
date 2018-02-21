import Jobs from '../collection'

module.exports = ->
  Jobs.import.startJobServer()
  Jobs.cache.startJobServer()
