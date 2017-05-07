moment = require 'moment-timezone'

module.exports =
  duration: ->
    moment(@end).diff(moment(@start))
