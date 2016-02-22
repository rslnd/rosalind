@Schema ||= {}

Meteor.startup ->
  Template.registerHelper('Schema', Schema) if Meteor.isClient
