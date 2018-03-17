import { InboundCalls } from '../'
import { Comments } from '../../comments'
import Time from '../../../util/time'
import { publish, publishComposite, publishCompositeTable } from '../../../util/meteor/publish'
import { Counts } from 'meteor/tmeasday:publish-counts'

export default () => {
  publish({
    name: 'inboundCalls-counts',
    roles: ['inboundCalls'],
    fn: function () {
      Counts.publish(this, 'inboundCalls', InboundCalls.find({}))
      Counts.publish(this, 'inboundCalls-resolvedToday', InboundCalls.find({
        removed: true,
        removedAt: { $gte: Time.startOfToday() }
      }))
      return undefined
    }
  })

  publishComposite({
    name: 'inboundCalls',
    roles: ['inboundCalls'],
    fn: function () {
      this.unblock()
      return {
        find: function () {
          this.unblock()
          return InboundCalls.find({ removed: { $ne: true } })
        },
        children: [
          {
            find: function (inboundCall) {
              return Comments.find({ docId: inboundCall._id })
            }
          }
        ]
      }
    }
  })

  publishCompositeTable({
    name: 'inboundCalls-table',
    roles: ['inboundCalls'],
    args: {
      ids: [String]
    },
    fn: function ({ ids }) {
      this.unblock()
      return {
        find: function () {
          this.unblock()
          return InboundCalls.find({ _id: { $in: ids } }, { removed: true })
        },
        children: [
          {
            find: function (inboundCall) {
              return Comments.find({ docId: inboundCall._id })
            }
          }
        ]
      }
    }

  })
}
