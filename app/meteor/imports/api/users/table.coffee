import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import Users from './collection'

module.exports = new Tabular.Table
  name: 'Users',
  collection: Users
  columns: [
    { data: 'profile.lastName', title: 'Name', render: (val, type, doc) -> doc.fullNameWithTitle() }
    { data: 'getRoles()', title: 'Berechtigungen' }
    { data: '_id', render: (val) -> '<a href="/users/' + val + '/edit">Bearbeiten</a>' }
  ],
  order: [[0, 'asc'], [2, 'asc']]
  extraFields: ['profile', 'username', 'groupId']
  stateSave: true
  allow: (userId) ->
    Roles.userIsInRole(userId, ['admin'])
