import { action } from '../../../util/meteor/action'
import { Events } from '../../events'

export const setNote = ({ Records }) =>
  action({
    name: 'records/setNote',
    roles: ['*'],
    args: {
      recordId: String,
      note: String
    },
    fn({ recordId, note }) {
      Records.update({ _id: recordId }, {
        $set: { note }
      })

      Events.post('records/setNote', { recordId })

      return recordId
    }
  })
