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
