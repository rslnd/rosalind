import { SimpleSchema } from 'meteor/aldeed:simple-schema'

const Placeholder = new SimpleSchema({
  x: {
    type: Number
  },

  y: {
    type: Number
  },

  page: {
    type: Number,
  },

  fontSize: {
    type: Number
  },

  qr: {
    type: Boolean,
    optional: true
  },

  bold: {
    type: Boolean,
    optional: true
  },

  value: {
    type: String,
    allowedValues: [
      'appointmentId',
      'currentDate',
      'birthday',
      'patientFullNameWithTitle',
      'assigneeFullNameWithTitle',
      'consentId',
      'templateId',
      'appointmentId',
      'patientId',
      'assigneeId',
      'clientId',
    ]
  }
})

export const Schema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['consent']
  },

  name: {
    type: String
  },

  localPath: {
    type: String,
    optional: true
  },

  base64: {
    type: String,
    optional: true
  },

  order: {
    type: Number,
    optional: true
  },

  placeholders: {
    type: [Placeholder],
    optional: true
  }
})
