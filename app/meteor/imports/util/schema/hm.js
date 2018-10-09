import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const HM = new SimpleSchema({
  h: { type: Number, min: 0, max: 23 },
  m: { type: Number, min: 0, max: 59 }
})
