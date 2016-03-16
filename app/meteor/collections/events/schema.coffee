@Events = new Mongo.Collection('events')

Schema.Events = new SimpleSchema
  type:
    type: String
    index: 1

  level:
    type: String
    allowedValues: [
      'info'
      'warning'
      'error'
    ]
    index: 1

  subject:
    type: SimpleSchema.RegEx.Id
    optional: true
    index: 1

  payload:
    type: Object
    blackbox: true
    optional: true

  createdAt:
    type: Date
    autoValue: Util.autoCreatedAt

  createdBy:
    type: String
    autoValue: Util.autoCreatedBy
    optional: true

Meteor.startup ->
  Events.attachSchema(Schema.Events)
