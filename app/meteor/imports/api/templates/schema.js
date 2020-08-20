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

  value: {
    type: String,
    allowedValues: [
      'appointmentId',
      'currentDate',
      'patientFullNameWithTitle',
      'assigneeFullNameWithTitle',
      'waitlistAssigneeFullNameWithTitle'
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
