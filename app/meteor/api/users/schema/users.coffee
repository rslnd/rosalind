{ SimpleSchema } = require 'meteor/aldeed:simple-schema'
{ Auto, Profile, External } = require 'util/schema'

Schema = new SimpleSchema
  username:
    type: String
    regEx: /^[a-z0-9A-Z_]*$/

  groupId:
    type: SimpleSchema.RegEx.Id
    optional: true

  createdAt:
    type: Date
    optional: true
    autoValue: Auto.createdAt

  profile:
    type: Profile
    optional: true

  external:
    type: External
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

  settings:
    type: Object
    optional: true
    blackbox: true

Schema.i18n('user')

module.exports = Schema
