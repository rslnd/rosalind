Meteor.startup ->

  locale = 'de-AT'

  TAPi18n.setLanguage(locale)
  moment.locale(locale)
