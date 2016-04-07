{ SimpleSchema } = require 'meteor/aldeed:simple-schema'
Auto = require '/imports/util/schema/auto'

schema = new SimpleSchema
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
    autoValue: Auto.createdAt
    optional: true
    index: -1

  createdBy:
    type: String
    autoValue: Auto.createdBy
    optional: true

schema.i18n('inboundCalls.form')

module.exports = schema
