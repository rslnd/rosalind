import { InboundCalls, InboundCallsTopics } from '../'
import flatten from 'lodash/flatten'
import moment from 'moment'
import { Comments } from '../../comments'
import { Patients } from '../../patients'
import { publish, publishComposite, Optional } from '../../../util/meteor/publish'

export default () => {
  publish({
    name: 'inboundCallsTopics',
    roles: ['inboundCalls'],
    fn: function () {
      return InboundCallsTopics.find({})
    }
  })

  publishComposite({
    name: 'inboundCalls',
    roles: ['inboundCalls'],
    fn: function () {
      return {
        find: function () {
          return InboundCalls.find({ removed: { $ne: true } })
        },
        children: [
          {
            find: function (inboundCall) {
              return Comments.find({ docId: inboundCall._id })
            }
          },
          {
            find: function(inboundCall) {
              return Patients.find({
                _id: inboundCall.patientId
              }, { sort: { lastName: 1 }, limit: 1 })
            }
          }
        ]
      }
    }
  })

  publishComposite({
    name: 'inboundCalls-2',
    roles: ['inboundCalls'],
    args: {
      topicId: Optional(String),
      patientId: Optional(String),
      removed: Optional(Boolean),
      page: Optional(Number)
    },
    fn: function ({ topicId, patientId, removed, page = 0 }) {
      const selector = {
        topicId: topicId || null
      }

      if (removed) {
        selector.removed = true
      }

      if (patientId) {
        selector.patientId = patientId
      }

      const pageSize = 15
      const options = {
        sort: {
          removedAt: -1,
          createdAt: 1
        },
        limit: pageSize,
        skip: page * pageSize
      }

      if (removed) {
        options.removed = true
      }

      return {
        find: function () {
          const s = InboundCalls.find(selector, options)
          console.log(selector, s.count())
          return s
        },
        children: [
          {
            find: function (inboundCall) {
              return Comments.find({ docId: inboundCall._id })
            }
          },
          {
            find: function(inboundCall) {
              return Patients.find({
                _id: inboundCall.patientId
              }, { sort: { lastName: 1 }, limit: 1 })
            }
          }
        ]
      }
    }
  })
}
