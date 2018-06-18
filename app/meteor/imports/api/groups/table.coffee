import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import Groups from './collection'

if Meteor.isClient
  require('../../client/old/templates/application/partials/groupIcon.tpl.jade')

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
