import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import Tags from './collection'

module.exports = new Tabular.Table
  name: 'Tags'
  collection: Tags
  columns: [
    { data: 'order', title: '#' }
    { data: 'tag', title: 'Tag' }
    { data: 'description', title: 'Description' }
    { data: 'duration', title: 'Duration' }
    { data: 'reportAs', title: 'Report As' }
    { data: 'color', title: 'Color', render: (val) -> "<span style='background-color: #{val}; color: white; padding 2px; border-radius: 3px;'>#{val}</span>" }
    { tmpl: Meteor.isClient and Template.editThis }
  ]
  order: [[0, 'asc']]
  allow: (userId) ->
    Roles.userIsInRole(userId, ['admin'])
