{ SimpleSchema } = require 'meteor/aldeed:simple-schema'
{ Auto, Day, External } = require '/imports/util/schema'

module.exports = new SimpleSchema
  day:
    type: Day
    index: true
    unique: true

  total:
    type: Object
    blackbox: true
    optional: true

  assignees:
    type: [Object]
    blackbox: true
    optional: true

  external:
    optional: true
    type: External

  createdAt:
    type: Date
    autoValue: Auto.createdAt
    optional: true
