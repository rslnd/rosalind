import Auto from './auto'
import { Day } from './day'
import { External } from './external'
import { Log } from './log'
import { HM } from './hm'

export const safeMediaTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

export const File = new SimpleSchema({
  b64: {
    type: String,
  },
  name: {
    type: String
  },
  mediaType: {
    type: String,
    allowedValues: safeMediaTypes
  },
  size: {
    type: Number
  }
})

export { Auto, External, Day, Log, HM }
