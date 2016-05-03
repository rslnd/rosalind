moment = require 'moment'

require('moment/locale/de-AT')
moment.locale('de-AT')

if window?.testing
  moment.locale('en-US')

module.exports = { moment }
