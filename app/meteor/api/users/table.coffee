{ Meteor } = require 'meteor/meteor'
{ Roles } = require 'meteor/alanning:roles'
Users = require './collection'

module.exports = ->
  new Tabular.Table
    name: 'Users',
    collection: Users
    columns: [
      { data: 'status', tmpl: Meteor.isClient and Template.userStatus }
      { data: 'profile.lastName', title: 'Name', render: (val, type, doc) -> doc.fullNameWithTitle() }
      { data: 'getRoles()', title: 'Berechtigungen' }
      { data: 'lastActivity()', title: 'Zuletzt gesehen' }
      { data: '_id', render: (val) -> '<a href="/users/' + val + '/edit">Bearbeiten</a>' }
    ],
    order: [[0, 'asc'], [2, 'asc']]
    extraFields: ['profile', 'username', 'groupId']
    stateSave: true
    allow: (userId) ->
      Roles.userIsInRole(userId, ['admin'])
