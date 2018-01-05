import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Day } from './day'

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

  lastName:
    type: String
    optional: true

  lastNameNormalized:
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

  noSMS:
    type: Boolean
    optional: true

  noCall:
    type: Boolean
    optional: true

  address:
    type: Address
    optional: true

  banned:
    type: Boolean
    optional: true

Profile.i18n('user.profile')

module.exports = {
  Contact
  Address
  Profile
}
