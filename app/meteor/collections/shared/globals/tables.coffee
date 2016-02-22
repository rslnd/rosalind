@TabularTables ||= {}

Meteor.startup ->
  Template.registerHelper('TabularTables', TabularTables) if Meteor.isClient
