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

export const Contact = new SimpleSchema({
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
  },

  addedBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  addedAt: {
    type: Date,
    optional: true
  },

  noConsent: {
    type: Boolean,
    optional: true
  },

  hasNone: {
    type: Boolean,
    optional: true
  },

  portalVerifiedAt: {
    type: Date,
    optional: true
  },

  portalVerifiedBy: {
    type: SimpleSchema.RegEx.Id,
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
    optional: true,
    index: 1
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
    optional: true
  },

  label: {
    type: String,
    optional: true
  },

  contacts: {
    type: [Contact],
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
    index: 1
  },

  insuranceNetwork: {
    type: String,
    optional: true
  },

  isPrivateInsurance: {
    type: Boolean,
    optional: true
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

  createdViaPortal: {
    type: Boolean,
    optional: true
  },

  removed: {
    type: Boolean,
    optional: true,
    index: 1
  },

  updatedAt: {
    type: Date,
    optional: true,
    index: -1
  },

  updatedBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  portalVerifiedAt: {
    type: Date,
    optional: true
  },

  portalVerifiedBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  portalTwoFactorCode: {
    type: String,
    optional: true,
    index: 1
  },

  portalTwoFactorCodeCreatedAt: {
    type: String,
    optional: true
  },

  portalSessionCreatedAt: {
    type: Date,
    optional: true
  },

  portalSessionToken: {
    type: String,
    optional: true,
    index: 1
  }
})
