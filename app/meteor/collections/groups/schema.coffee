@Groups = new Mongo.Collection('groups')
Ground.Collection(Groups)

Schema.Groups = new SimpleSchema
  name:
    type: String

  icon:
    type: String
    optional: true

  color:
    type: String
    optional: true

  order:
    type: Number
    optional: true

Meteor.startup ->
  Groups.attachSchema(Schema.Groups)
