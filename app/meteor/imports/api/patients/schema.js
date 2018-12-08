import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { External, Day, Auto } from '../../util/schema'

// TODO: Refactor to collection
export const agreements = [
  'privacy'
]

const Agreement = new SimpleSchema({
  agreedAt: {
    type: Date
  },

  to: {
    type: String,
    allowedValues: agreements
  },

  witnessBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  }
})

const Contact = new SimpleSchema({
  value: {
    type: String
  },

  valueNormalized: {
    type: String,
    optional: true,
    index: 1
  },

  channel: {
    allowedValues: ['Phone', 'Email'],
    type: String
  },

  order: {
    type: Number,
    optional: true
  },

  note: {
    type: String,
    optional: true
  }
})

const Address = new SimpleSchema({
  line1: {
    type: String,
    optional: true
  },

  line2: {
    type: String,
    optional: true
  },

  postalCode: {
    type: String,
    optional: true
  },

  locality: {
    type: String,
    optional: true
  },

  country: {
    type: String,
    optional: true
  }
})

export default new SimpleSchema({
  firstName: {
    type: String,
    optional: true
  },

  lastName: {
    type: String,
    optional: true
  },

  lastNameNormalized: {
    type: String,
    optional: true,
    index: 1
  },

  titlePrepend: {
    type: String,
    optional: true
  },

  titleAppend: {
    type: String,
    optional: true
  },

  birthday: {
    type: Day,
    optional: true,
    index: 1
  },

  gender: {
    type: String,
    allowedValues: ['Male', 'Female'],
    optional: true
  },

  contacts: {
    type: [ Contact ],
    optional: true
  },

  noSMS: {
    type: Boolean,
    optional: true
  },

  noCall: {
    type: Boolean,
    optional: true
  },

  address: {
    type: Address,
    optional: true
  },

  banned: {
    type: Boolean,
    optional: true
  },

  insuranceId: {
    type: String,
    optional: true,
    unique: true,
    index: 1
  },

  note: {
    type: String,
    optional: true
  },

  agreements: {
    type: [Agreement],
    optional: true
  },

  externalRevenue: {
    type: Number,
    decimal: true,
    optional: true
  },

  external: {
    optional: true,
    type: External
  },

  patientSince: {
    type: Date,
    optional: true
  },

  createdAt: {
    type: Date,
    autoValue: Auto.createdAt,
    optional: true
  },

  createdBy: {
    type: SimpleSchema.RegEx.Id,
    autoValue: Auto.createdBy,
    optional: true
  },

  removed: {
    type: Boolean,
    optional: true,
    index: 1
  }
})
