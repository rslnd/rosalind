@InboundCalls = new Mongo.Collection('inboundCalls')
Ground.Collection(InboundCalls)

Schema.InboundCalls = new SimpleSchema
  firstName:
    type: String
    optional: true

  lastName:
    type: String

  telephone:
    type: String
    optional: true

  note:
    type: String

  privatePatient:
    type: Boolean

  createdAt:
    type: Date
    autoValue: Util.autoCreatedAt
    optional: true
    index: -1

  createdBy:
    type: String
    autoValue: Util.autoCreatedBy
    optional: true

Meteor.startup ->
  Schema.InboundCalls.i18n('inboundCalls.form')
  InboundCalls.attachSchema(Schema.InboundCalls)
  InboundCalls.attachBehaviour('softRemovable')
