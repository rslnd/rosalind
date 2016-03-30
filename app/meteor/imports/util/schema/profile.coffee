{ SimpleSchema } = require 'meteor/aldeed:simple-schema'

Day = new SimpleSchema
  year:
    type: Number
    index: 1

  month:
    type: Number
    index: 1
    min: 1
    max: 12

  day:
    type: Number
    index: 1
    min: 1
    max: 31

Contact = new SimpleSchema
  value:
    type: String

  channel:
    allowedValues: ['Phone', 'Email']
    type: String

  order:
    type: Number
    optional: true

  note:
    type: String
    optional: true

Address = new SimpleSchema
  line1:
    type: String
    optional: true

  line2:
    type: String
    optional: true

  postalCode:
    type: String
    optional: true

  locality:
    type: String
    optional: true

  country:
    type: String
    optional: true

Profile = new SimpleSchema
  firstName:
    type: String
    optional: true
    index: 1

  lastName:
    type: String
    optional: true
    index: 1

  titlePrepend:
    type: String
    optional: true

  titleAppend:
    type: String
    optional: true

  birthday:
    type: Day
    optional: true
    index: 1

  gender:
    type: String
    allowedValues: ['Male', 'Female']
    optional: true

  employee:
    type: Boolean
    optional: true
    index: 1

  contacts:
    type: [ Contact ]
    optional: true

  address:
    type: Address
    optional: true

Profile.i18n('user.profile')

module.exports = {
  Day
  Contact
  Address
  Profile
}
