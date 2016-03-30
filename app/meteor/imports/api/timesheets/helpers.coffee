moment = require 'moment'

module.exports =
  duration: ->
    moment(@end).diff(moment(@start))
