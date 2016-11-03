{ Meteor } = require 'meteor/meteor'
{ Roles } = require 'meteor/alanning:roles'
Tags = require './collection'

module.exports = new Tabular.Table
  name: 'Tags'
  collection: Tags
  columns: [
    { data: 'order', title: '#' }
    { data: 'tag', title: 'Tag' }
    { data: 'description', title: 'Description' }
    { data: 'length', title: 'Length' }
    { data: 'color', title: 'Color', render: (val) -> "<span style='background-color: #{val}; color: white; padding 2px; border-radius: 3px;'>#{val}</span>" }
    { tmpl: Meteor.isClient and Template.editThis }
  ]
  order: [[0, 'asc']]
  allow: (userId) ->
    Roles.userIsInRole(userId, ['admin'])
