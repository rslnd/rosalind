import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import Groups from './collection'

module.exports = new Tabular.Table
  name: 'Groups'
  collection: Groups
  columns: [
    { data: 'order', tmpl: Meteor.isClient and Template.groupIcon }
    { data: 'name', title: 'Name' }
    { tmpl: Meteor.isClient and Template.editThis }
  ]
  order: [[0, 'asc']]
  extraFields: ['color', 'icon']
  allow: (userId) ->
    Roles.userIsInRole(userId, ['admin'])
