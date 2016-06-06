{ SimpleSchema } = require 'meteor/aldeed:simple-schema'
{ Auto, External } = require '/imports/util/schema'

Schema = new SimpleSchema
  start:
    type: Date
    index: -1

  end:
    type: Date
    index: -1

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

Schema.i18n('appointments.form')

module.exports = Schema
