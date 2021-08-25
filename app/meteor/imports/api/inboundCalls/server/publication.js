import { InboundCalls, InboundCallsTopics } from '../'
import flatten from 'lodash/flatten'
import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { Comments } from '../../comments'
import { Patients } from '../../patients'
import { publish, publishComposite, Optional } from '../../../util/meteor/publish'
import { hasRole } from '../../../util/meteor/hasRole'

const restrictTopicsToRole = (userId, field = 'topicId') => {
  if (hasRole(userId, ['inboundCalls'])) {
    return {}
  }

  const topicIds = InboundCallsTopics.find({}).fetch().filter(t => {
    return hasRole(userId, ['inboundCalls-topic-' + t.slug || 'null'])
  }).map(t => t._id)

  if (hasRole(userId, ['inboundCalls-topic-null'])) {
    topicIds.push(null)
  }

  return { [field]: { $in: topicIds } }
}

export default () => {
  publish({
    name: 'inboundCallsTopics',
    roles: ['inboundCalls', 'inboundCalls-topic-*'],
    fn: function () {
      return InboundCallsTopics.find({ ...restrictTopicsToRole(this.userId, '_id') })
    }
  })

  publishComposite({
    name: 'inboundCalls',
    roles: ['inboundCalls', 'inboundCalls-topic-*'],
    fn: function () {
      return {
        find: function () {
          return InboundCalls.find({ ...restrictTopicsToRole(this.userId), removed: { $ne: true } })
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
    roles: ['inboundCalls', 'inboundCalls-topic-*'],
    args: {
      topicId: Optional(Match.OneOf(false, Optional(String))),
      patientId: Optional(String),
      removed: Optional(Boolean),
      page: Optional(Number),
      query: Optional(String)
    },
    fn: function ({ topicId, patientId, removed, page = 0, query }) {
      let selector = {}

      if (topicId !== false) { // false == all
        const topic = InboundCallsTopics.findOne({ _id: topicId })
        const topicSlug = (topicId === null) ? 'null' : (topic && topic.slug)
  
        if (!topicSlug || !hasRole(this.userId, ['inboundCalls', 'inboundCalls-topic-' + topicSlug])) {
          // Missing role, return empty cursor
          return {
            find: () => InboundCalls.find({ _id: 'dummy' })
          }
        }

        selector.topicId = topicId
      }

      if (removed) {
        selector.removed = true
      }

      if (patientId) {
        selector.patientId = patientId
      }

      if (query && query.length >= 2) {
        selector.$or = [
          { note: new RegExp('\\b' + query, 'im') },
          { lastName: new RegExp('^' + query, 'im') },
          { firstName: new RegExp('^' + query, 'im') },
          { telephone: new RegExp(query, 'im') }
        ]
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
          console.log(selector, s.count(), topicId)
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
