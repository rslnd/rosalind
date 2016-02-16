@Appointments = new Mongo.Collection 'appointments',
  idGeneration: 'MONGO'


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

  heuristic:
    type: Boolean
    optional: true
    index: 1

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

  removed:
    type: Boolean
    optional: true
    index: 1


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


  patient: ->
    Meteor.users.findOne(@patientId)

  assignee: ->
    Meteor.users.findOne(@assigneeId)

  notes: ->
    n = [@note, @external?.terminiko?.note]
    return _.filter(n, (s) -> s and s.length >= 1).join('\n')

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
  selector =
    admittedAt: null
    admittedBy: null
    treatedAt: null
    treatedBy: null
    start:
      $gte: moment(date).startOf('day').toDate()
      $lte: moment(date).endOf('day').toDate()
  Appointments.find(selector, sort: { start: 1 })


Appointments.findAdmitted = (date) ->
  selector =
    admittedAt: { $ne: null }
    admittedBy: { $ne: null }
    treatedAt: null
    treatedBy: null
    start:
      $gte: moment(date).startOf('day').toDate()
      $lte: moment(date).endOf('day').toDate()
  Appointments.find(selector, sort: { admittedAt: 1 })


Appointments.findTreating = (date) ->
  selector =
    admittedAt: { $ne: null }
    admittedBy: { $ne: null }
    treatedAt: { $ne: null }
    treatedBy: { $ne: null }
    start:
      $gte: moment(date).startOf('day').toDate()
      $lte: moment(date).endOf('day').toDate()
  Appointments.find(selector, sort: { treatedAt: 1 })

Appointments.isAvailable = (options) ->
  Schedules.isAvailable(options)

TabularTables.Appointments = new Tabular.Table
  name: 'ResolvedAppointments'
  collection: Appointments
  pub: 'appointments'
  columns: [
    { data: 'start', title: 'Termin', render: (val) -> moment(val).calendar() }
    { data: 'note', title: 'Notiz' }
    { data: 'privateAppointment', title: 'Privat', render: (val, type, doc) -> doc.privateOrInsurance() }
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
    pastAppointments =
      end: { $lt: Time.startOfToday() }
      $or: [ { removed: true }, { removed: null } ]

    resolvedAppointments = { removed: true }
    selector.$or = [ resolvedAppointments, pastAppointments ]
    selector



Meteor.startup ->
  Schema.Appointments.i18n('appointments.form')
  Appointments.attachSchema(Schema.Appointments)
  Appointments.attachBehaviour('softRemovable')
