{ SimpleSchema } = require 'meteor/aldeed:simple-schema'
{ Profile, External, Auto } = require 'util/schema'

module.exports = new SimpleSchema
  insuranceId:
    type: String
    optional: true
    index: 1

  note:
    type: String
    optional: true

  profile:
    type: Profile
    optional: true

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
