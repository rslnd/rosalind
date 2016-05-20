moment = require 'moment'
{ Tracker } = require 'meteor/tracker'
{ Session } = require 'meteor/session'
{ TAPi18n } = require 'meteor/tap:i18n'

module.exports = ->

  locale = 'de-AT'
  TAPi18n.setLanguage(locale)
  moment.locale(locale)

  Tracker.autorun ->
    if Session.get('test')
      TAPi18n.setLanguage('en')
      moment.locale('en-US')
