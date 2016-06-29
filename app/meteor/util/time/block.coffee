moment = require 'moment'
require 'moment-round'

module.exports =
  block: (time) ->
    start = moment(time).floor(10, 'minutes')
    end = start.clone().add(10, 'minutes')
    { start, end }
