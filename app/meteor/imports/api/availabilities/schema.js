import { SimpleSchema } from 'meteor/aldeed:simple-schema'

const Pause = new SimpleSchema({
  from: {
    type: Date
  },

  to: {
    type: Date
  },

  slots: {
    type: Number
  },

  note: {
    type: String,
    optional: true
  }
})

export const schema = new SimpleSchema({
  duration: {
    type: Number
  },

  from: {
    type: Date,
    index: 1
  },

  to: {
    type: Date,
    index: 1
  },

  slotSize: {
    type: Number
  },

  slotCount: {
    type: Number
  },

  slotsAvailable: {
    type: Number
  },

  slotsUsed: {
    type: Number
  },

  pauses: {
    type: [Pause],
    optional: true
  },

  assigneeId: {
    type: SimpleSchema.RegEx.Id,
    index: 1
  },

  calendarId: {
    type: SimpleSchema.RegEx.Id,
    index: 1
  }
})
