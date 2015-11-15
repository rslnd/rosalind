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

Groups.attachSchema(Schema.Groups)

Groups.helpers
  users: ->
    Meteor.users.find(groupId: @_id).fetch()

  usersCount: ->
    Meteor.users.find(groupId: @_id).count()

  collection: ->
    Groups


Groups.all = ->
  Groups.find({}, sort: { order: 1 }).fetch()


TabularTables.Groups = new Tabular.Table
  name: 'Groups'
  collection: Groups
  columns: [
    { data: 'order', tmpl: Meteor.isClient and Template.groupIcon }
    { data: 'name', title: 'Name' }
    { data: 'usersCount()', title: 'Benutzer' }
    { tmpl: Meteor.isClient and Template.editLink }
  ]
  order: [[0, 'asc']]
  extraFields: ['color', 'icon']
  allow: (userId) ->
    Roles.userIsInRole(userId, ['admin'])
