{ SimpleSchema } = require 'meteor/aldeed:simple-schema'
{ Auto, Profile } = require '/imports/util/schema'

Schema = new SimpleSchema
  username:
    type: String
    regEx: /^[a-z0-9A-Z_]*$/

  groupId:
    type: SimpleSchema.RegEx.Id
    autoform:
      options: -> _.map(Groups.all(), (g) -> { label: g.name, value: g._id })
    optional: true

  createdAt:
    type: Date
    optional: true
    autoValue: Auto.createdAt

  profile:
    type: Profile
    optional: true

  services:
    type: Object
    optional: true
    blackbox: true

  roles:
    type: Object
    optional: true
    blackbox: true

  status:
    type: Object
    optional: true
    blackbox: true

Schema.i18n('user')

module.exports = Schema
