{ SimpleSchema } = require 'meteor/aldeed:simple-schema'

module.exports = new SimpleSchema
  name:
    type: String

  icon:
    type: String
    optional: true

  color:
    type: String
    optional: true

  order:
    type: Number
    optional: true
