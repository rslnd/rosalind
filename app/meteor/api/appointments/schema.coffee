{ SimpleSchema } = require 'meteor/aldeed:simple-schema'
{ Auto, External } = require 'util/schema'

Schema = new SimpleSchema
  start:
    type: Date
    index: -1

  end:
    type: Date
    index: -1

  patientId:
    type: SimpleSchema.RegEx.Id
    optional: true
    index: 1

  assigneeId:
    type: SimpleSchema.RegEx.Id
    optional: true
    index: 1

  assistantIds:
    type: [SimpleSchema.RegEx.Id]
    optional: true

  note:
    type: String
    optional: true

  privateAppointment:
    type: Boolean
    defaultValue: false

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

  heuristic:
    type: Boolean
    optional: true
    index: 1

  external:
    optional: true
    type: External

  createdAt:
    type: Date
    autoValue: Auto.createdAt
    optional: true

  createdBy:
    type: SimpleSchema.RegEx.Id
    autoValue: Auto.createdBy
    optional: true

  removed:
    type: Boolean
    optional: true
    index: 1

  canceled:
    type: Boolean
    optional: true
    index: 1

  admitted:
    type: Boolean
    optional: true
    index: 1

  treated:
    type: Boolean
    optional: true
    index: 1

  lockedAt:
    type: Date
    optional: true
    index: 1

  lockedBy:
    type: SimpleSchema.RegEx.Id
    autoValue: Auto.createdBy
    optional: true
    index: 1

Schema.i18n('appointments.form')

module.exports = Schema
