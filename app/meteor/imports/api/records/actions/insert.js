import { Meteor } from 'meteor/meteor'
import { action } from '../../../util/meteor/action'
import { Events } from '../../events'

export const insert = ({ Records }) =>
  action({
    name: 'records/insert',
    roles: ['*'],
    args: {
      patientId: String,
      calendarId: String,
      note: String,
      type: String
    },
    fn({ patientId, calendarId, note, type }) {
      if (type === 'future') {
        const existingRecord = Records.findOne({
          patientId,
          calendarId,
          type: 'future',
          removed: { $ne: true }
        })
        if (existingRecord) {
          throw new Meteor.Error('Cannot have more than one active future note per patient and calendar')
        }
      }

      const recordId = Records.insert({ patientId, calendarId, note, type })

      Events.post('records/insert', { recordId })

      return recordId
    }
  })
