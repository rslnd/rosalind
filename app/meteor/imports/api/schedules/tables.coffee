import { Meteor } from 'meteor/meteor'
import Helpers from '../../util/helpers'
import { fullNameWithTitle } from '../users/methods/name'
import { Users } from '../users'
import Schedules from './collection'
import Schema from './schema'

module.exports =
  holidays: new Tabular.Table
    name: 'Holidays'
    collection: Schedules
    columns: [
      { data: 'note', title: 'Feiertag' }
      { data: 'start', title: 'von' }
      { data: 'end', title: 'bis' }
      { tmpl: Meteor.isClient and Template.deleteThis }
    ]
    order: [[1, 'desc']]
    sub: new SubsManager()
    extraFields: Schema._firstLevelSchemaKeys
    responsive: true
    autoWidth: false
    stateSave: true
    changeSelector: (selector) ->
      selector.type = 'holidays'
      selector

  businessHoursOverride: new Tabular.Table
    name: 'BusinessHoursOverride'
    collection: Schedules
    columns: [
      { data: 'note', title: 'Notiz' }
      { data: 'start', title: 'von' }
      { data: 'end', title: 'bis' }
      { tmpl: Meteor.isClient and Template.deleteThis }
    ]
    order: [[1, 'desc']]
    sub: new SubsManager()
    extraFields: Schema._firstLevelSchemaKeys
    responsive: true
    autoWidth: false
    stateSave: true
    changeSelector: (selector) ->
      selector.type = 'businessHoursOverride'
      selector



  override: new Tabular.Table
    name: 'schedulesOverride'
    collection: Schedules
    columns: [
      { data: 'userId', title: 'Mitarbeiter', render: (_id) -> fullNameWithTitle(Users.findOne({ _id })) }
      { data: 'available', title: 'Anwesend' }
      { data: 'note', title: 'Notiz' }
      { data: 'start', title: 'von' }
      { data: 'end', title: 'bis' }
      { tmpl: Meteor.isClient and Template.deleteThis }
    ]
    order: [[1, 'desc']]
    sub: new SubsManager()
    extraFields: Schema._firstLevelSchemaKeys
    responsive: true
    autoWidth: false
    stateSave: true
    changeSelector: (selector) ->
      selector.type = 'override'
      selector
