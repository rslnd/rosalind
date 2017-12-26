import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { Calendars } from './collection'

module.exports = new Tabular.Table
  name: 'Calendars'
  collection: Calendars
  columns: [
    { data: 'order', title: '#' }
    { data: 'tag', title: 'Tag' }
    { data: 'description', title: 'Description' }
    { data: 'length', title: 'Length' }
    { data: 'reportAs', title: 'Report As' }
    { data: 'color', title: 'Color', render: (val) -> "<span style='background-color: #{val}; color: white; padding 2px; border-radius: 3px;'>#{val}</span>" }
  ]
  order: [[0, 'asc']]
  allow: (userId) ->
    Roles.userIsInRole(userId, ['admin'])
