moment = require 'moment'
{ TAPi18n } = require 'meteor/tap:i18n'

module.exports =
  dateWeekday: (date) ->
    moment(date).format(TAPi18n.__('time.dateFormatWeekday'))
