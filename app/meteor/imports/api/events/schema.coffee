{ SimpleSchema } = require 'meteor/aldeed:simple-schema'
Auto = require '/imports/util/schema/auto'

module.exports = new SimpleSchema
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
    defaultValue: 'info'
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
    autoValue: Auto.createdAt

  createdBy:
    type: String
    autoValue: Auto.createdBy
    optional: true
