moment = require 'moment'
require 'moment/locale/de-at'
{ Meteor } = require 'meteor/meteor'
{ TAPi18n } = require 'meteor/tap:i18n'

module.exports = ->
  unless window.testing
    locale = 'de-AT'
    TAPi18n.setLanguage(locale)
    moment.locale(locale)
