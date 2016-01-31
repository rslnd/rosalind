@Appointments = new Mongo.Collection('appointments')
Ground.Collection(Appointments)


Schema.Appointments = new SimpleSchema
  start:
    type: Date
    index: -1

  end:
    type: Date

  type:
    type: String

  admittedAt:
    type: Date
    optional: true
    index: 1

  admittedBy:
    type: SimpleSchema.RegEx.Id
    optional: true
    index: 1

  treatedAt:
    type: Date
    optional: true
    index: 1

  treatedBy:
    type: SimpleSchema.RegEx.Id
    optional: true
    index: 1

  patientId:
    type: SimpleSchema.RegEx.Id
    index: 1

  assigneeId:
    type: SimpleSchema.RegEx.Id
    index: 1

  assistantIds:
    type: [SimpleSchema.RegEx.Id]
    optional: true

  note:
    type: String
    optional: true

  privateAppointment:
    type: Boolean

  external:
    optional: true
    type: Schema.External

  createdAt:
    type: Date
    autoValue: Util.autoCreatedAt
    optional: true

  createdBy:
    type: SimpleSchema.RegEx.Id
    autoValue: Util.autoCreatedBy
    optional: true


Appointments.helpers
  privateOrInsurance: ->
    if @privateAppointment
      TAPi18n.__('appointments.private')
    else
      TAPi18n.__('appointments.insurance')

  open: ->
    not @admittedAt? and not @admittedBy? and not @treatedAt? and not @treatedBy? and not @removed

  admitted: ->
    @admittedAt? and @admittedBy? and not @treatedAt? and not @treatedBy? and not @removed

  treated: ->
    @admittedAt? and @admittedBy? and @treatedAt? and @treatedBy? and not @removed

  collection: ->
    Appointments

Appointments.setAdmitted = (id, time) ->
  Appointments.stateChange(id, time, 'admitted')

Appointments.setTreated = (id, time) ->
  Appointments.stateChange(id, time, 'treated')

Appointments.setResolved = (id, time) ->
  Appointments.softRemove(id)

Appointments.stateChange = (id, time, state) ->
  set = {}
  set[state + 'By'] = Meteor.user()._id
  set[state + 'At'] = if time then time.toDate() else moment().toDate()
  Appointments.update(id, { $set: set })


Appointments.findOpen = (date) ->
  Appointments.find
    admittedAt: null
    admittedBy: null
    treatedAt: null
    treatedBy: null
    start:
      $gte: moment(date).startOf('day').toDate()
      $lte: moment(date).endOf('day').toDate()

Appointments.findAdmitted = (date) ->
  Appointments.find
    admittedAt: { $ne: null }
    admittedBy: { $ne: null }
    treatedAt: null
    treatedBy: null
    start:
      $gte: moment(date).startOf('day').toDate()
      $lte: moment(date).endOf('day').toDate()

Appointments.findTreating = (date) ->
  Appointments.find
    admittedAt: { $ne: null }
    admittedBy: { $ne: null }
    treatedAt: { $ne: null }
    treatedBy: { $ne: null }
    start:
      $gte: moment(date).startOf('day').toDate()
      $lte: moment(date).endOf('day').toDate()

TabularTables.Appointments = new Tabular.Table
  name: 'ResolvedAppointments'
  collection: Appointments
  pub: 'appointments'
  columns: [
    { data: 'note', title: 'Notiz' }
    { data: 'privateAppointment', title: 'Privat', render: (val, type, doc) -> doc.privateOrInsurance() }
    { data: 'start', title: 'Termin', render: (val) -> moment(val).calendar() }
    { data: 'createdBy', title: 'Eintrag', render: (val) -> Helpers.getShortname(val) }
    { data: 'admittedBy', title: 'Empfang', render: (val) -> Helpers.getShortname(val) }
    { data: 'treatedBy', title: 'Behandlung', render: (val) -> Helpers.getShortname(val) }
    { title: '<i class="fa fa-commenting-o"></i>', tmpl: Meteor.isClient and Template.commentCount }
  ]
  order: [[0, 'desc']]
  sub: new SubsManager()
  extraFields: Schema.Appointments._firstLevelSchemaKeys
  responsive: true
  autoWidth: false
  stateSave: true
  changeSelector: (selector) ->
    selector.removed = true
    selector



Meteor.startup ->
  Schema.Appointments.i18n('appointments.form')
  Appointments.attachSchema(Schema.Appointments)
  Appointments.attachBehaviour('softRemovable')
