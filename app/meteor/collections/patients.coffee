@Patients = new Mongo.Collection('patients')
Ground.Collection(Patients)

Schema.Patients = new SimpleSchema
  profile:
    type: Schema.Profile
    optional: true

  createdAt:
    type: Date
    autoValue: Util.autoCreatedAt
    optional: true

  createdBy:
    type: String
    autoValue: Util.autoCreatedBy
    optional: true

TabularTables.Patients = new Tabular.Table
  name: 'Patients'
  collection: Patients
  pub: 'patients'
  columns: [
    { data: 'profile.lastName', title: 'Name', render: (val) -> Helpers.getFullNameWithTitle(val) }
    { title: '<i class="fa fa-commenting-o"></i>', tmpl: Meteor.isClient and Template.commentCount }
  ]
  order: [[0, 'desc']]
  sub: new SubsManager()
  extraFields: Schema.Patients._firstLevelSchemaKeys
  responsive: true
  autoWidth: false
  stateSave: true
  changeSelector: (selector) ->
    selector.removed = true
    selector


Meteor.startup ->
  Patients.attachBehaviour('softRemovable')
