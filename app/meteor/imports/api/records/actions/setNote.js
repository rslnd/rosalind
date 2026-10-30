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
    async fn ({ recordId, note }) {
      await Records.updateAsync({ _id: recordId }, {
        $set: { note }
      }, { trimStrings: false })

      Events.post('records/setNote', { recordId })

      return recordId
    }
  })
