Ground.Collection(Meteor.users)

Schema.User = new SimpleSchema
  username:
    type: String
    regEx: /^[a-z0-9A-Z_]*$/

  groupId:
    type: SimpleSchema.RegEx.Id
    autoform:
      options: -> _.map(Groups.all(), (g) -> { label: g.name, value: g._id })
    optional: true

  createdAt:
    type: Date
    optional: true
    autoValue: Util.autoCreatedAt

  profile:
    type: Schema.Profile
    optional: true

  services:
    type: Object
    optional: true
    blackbox: true

  roles:
    type: Object
    optional: true
    blackbox: true

  status:
    type: Object
    optional: true
    blackbox: true


Meteor.users.attachSchema(Schema.User)

Helpers.profile(Meteor.users)

Meteor.users.helpers
  lastActivity: ->
    if (@status and @status.lastActivity)
      TAPi18n.__('ui.status.lastActivity') + ' ' + moment(@status.lastActivity).fromNow()
    else if (@status and @status.online)
      TAPi18n.__('ui.status.online')
    else if (@status and @status.lastLogin and @status.lastLogin.date)
      TAPi18n.__('ui.status.lastLogin') + ' ' + moment(@status.lastLogin.date).fromNow()
    else
      TAPi18n.__('ui.status.never')

  shortname: ->
    if (@username.length <= 3)
      @username
    else
      _.map(@fullName().split(' '), (n) -> n.charAt(0) ).join('')

  group: ->
    group = Groups.findOne(@groupId)
    if (group)
      group.name

  getRoles: ->
    Roles.getRolesForUser(@_id).join(', ')

  lastToken: ->
    _(@services?.resume?.loginTokens).last()?.hashedToken

  collection: ->
    Meteor.users


Meteor.users.findOneByIdOrUsername = (idOrUsername) ->
  if (typeof idOrUsername is 'string')
    byId = Meteor.users.findOne(idOrUsername)
    if (byId)
      return byId

    byUsername = Meteor.users.findOne(username: idOrUsername)
    if (byUsername)
      return byUsername

   else if (typeof idOrUsername is 'object')
     if (idOrUsername.collection and idOrUsername.collection())
       return idOrUsername

     byCursor = (idOrUsername and idOrUsername.fetch and idOrUsername.fetch()[0])
     if (byCursor)
       return idOrUsername.fetch()[0]


Meteor.users.queryExactlyOne = (query) ->
  selector = {}

  selector['profile.titlePrepend'] = 'Dr.' if query.match(/Dr\./)
  query = query.replace('Dr. ', '')

  selector['$or'] = [
    { 'profile.lastName': query.split(' ')[0] }
    { 'profile.firstName': query.split(' ')[0] }
  ]

  Meteor.users.findOne(selector)


Meteor.users.byGroup = (selector = {}) ->
  _.map(Groups.all(selector), (g) -> { group: g, users: g.users() })



TabularTables.Users = new Tabular.Table
  name: 'Users',
  collection: Meteor.users
  columns: [
    { data: 'status', tmpl: Meteor.isClient and Template.status }
    { data: 'profile.lastName', title: 'Name', render: (val, type, doc) -> doc.fullNameWithTitle() }
    { data: 'getRoles()', title: 'Berechtigungen' }
    { data: 'group()', title: 'Gruppe' }
    { data: 'lastActivity()', title: 'Zuletzt gesehen' }
    { data: '_id', render: (val) -> '<a href="/users/' + val + '/edit">Bearbeiten</a>' }
  ],
  order: [[0, 'asc'], [2, 'asc']]
  extraFields: ['profile', 'username', 'groupId']
  stateSave: true
  allow: (userId) ->
    Roles.userIsInRole(userId, ['admin'])


Schema.UserLogin = new SimpleSchema
  name:
    type: String

  password:
    type: String
    min: 2


Schema.UserCreate = new SimpleSchema
  username:
    type: String


Schema.UserUpdatePassword = new SimpleSchema
  password:
    type: String

  userId:
    type: String


Schema.UserUpdateRoles = new SimpleSchema
  roles:
    type: String

  userId:
    type: String


Meteor.startup ->
  Schema.Profile.i18n('user.profile')
  Schema.User.i18n('user')
  Schema.UserLogin.i18n('login.form')

Accounts.config
  forbidClientAccountCreation: true
