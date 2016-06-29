{ SimpleSchema } = require 'meteor/aldeed:simple-schema'
Auto = require 'util/schema/auto'

module.exports = new SimpleSchema
  tag:
    type: String
    unique: true
    index: 1

  description:
    type: String
    optional: true

  color:
    type: String
    optional: true

  external:
    type: [ String ]
    optional: true
    index: 1

  createdBy:
    type: String
    regEx: SimpleSchema.RegEx.Id
    autoValue: Auto.createdBy
    optional: true

  createdAt:
    type: Date
    autoValue: Auto.createdAt
    index: 1
    optional: true
