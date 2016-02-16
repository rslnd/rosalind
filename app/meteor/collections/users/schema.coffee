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

Meteor.startup ->
  Meteor.users.attachSchema(Schema.User)
  Schema.User.i18n('user')
