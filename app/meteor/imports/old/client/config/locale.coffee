Meteor.startup ->
  unless window.testing
    locale = 'de-AT'
    TAPi18n.setLanguage(locale)
    moment.locale(locale)
