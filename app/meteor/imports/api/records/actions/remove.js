import { action } from '../../../util/meteor/action'
import { Events } from '../../events'

export const remove = ({ Records }) =>
  action({
    name: 'records/remove',
    roles: ['*'],
    args: {
      recordId: String
    },
    async fn({ recordId }) {
      console.log('removed by', this.userId)
      await Records.updateAsync({ _id: recordId, removed: { $ne: true } }, {
        $set: {
          removed: true,
          removedAt: new Date(),
          removedBy: this.userId
        }
      })

      Events.post('records/remove', { recordId })

      return recordId
    }
  })
