moment = require 'moment'
require 'moment/locale/de-at'
{ Meteor } = require 'meteor/meteor'


if Meteor.settings.test
  moment.locale('en-US')

else
  moment.locale('de-AT')


module.exports = { moment }
