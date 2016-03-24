TabularTables.Schedules = {}

TabularTables.Schedules.holidays = new Tabular.Table
  name: 'Holidays'
  collection: Schedules
  columns: [
    { data: 'note', title: 'Feiertag' }
    { data: 'start', title: 'von' }
    { data: 'end', title: 'bis' }
    { tmpl: Meteor.isClient and Template.deleteLink }
  ]
  order: [[1, 'desc']]
  sub: new SubsManager()
  extraFields: Schema.Schedules._firstLevelSchemaKeys
  responsive: true
  autoWidth: false
  stateSave: true
  changeSelector: (selector) ->
    selector.type = 'holidays'
    selector

TabularTables.Schedules.businessHoursOverride = new Tabular.Table
  name: 'BusinessHoursOverride'
  collection: Schedules
  columns: [
    { data: 'note', title: 'Notiz' }
    { data: 'start', title: 'von' }
    { data: 'end', title: 'bis' }
    { tmpl: Meteor.isClient and Template.deleteLink }
  ]
  order: [[1, 'desc']]
  sub: new SubsManager()
  extraFields: Schema.Schedules._firstLevelSchemaKeys
  responsive: true
  autoWidth: false
  stateSave: true
  changeSelector: (selector) ->
    selector.type = 'businessHoursOverride'
    selector



TabularTables.Schedules.override = new Tabular.Table
  name: 'schedulesOverride'
  collection: Schedules
  columns: [
    { data: 'userId', title: 'Mitarbeiter', render: (val) -> Helpers.getFullNameWithTitle(val) }
    { data: 'available', title: 'Anwesend' }
    { data: 'note', title: 'Notiz' }
    { data: 'start', title: 'von' }
    { data: 'end', title: 'bis' }
    { tmpl: Meteor.isClient and Template.deleteLink }
  ]
  order: [[1, 'desc']]
  sub: new SubsManager()
  extraFields: Schema.Schedules._firstLevelSchemaKeys
  responsive: true
  autoWidth: false
  stateSave: true
  changeSelector: (selector) ->
    selector.type = 'override'
    selector
