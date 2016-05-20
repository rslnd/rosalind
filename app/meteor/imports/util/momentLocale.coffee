moment = require 'moment'
require 'moment/locale/de-at'
{ Meteor } = require 'meteor/meteor'

moment.locale('de-AT')

if Meteor.settings.test
  moment.locale('en-US')

module.exports = { moment }
