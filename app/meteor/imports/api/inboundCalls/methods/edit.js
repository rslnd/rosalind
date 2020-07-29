import { Meteor } from 'meteor/meteor'
import { Match } from 'meteor/check'
import { Events } from '../../events'
import { action } from '../../../util/meteor/action'

export const edit = ({ InboundCalls }) =>
  action({
    name: 'inboundCalls/edit',
    roles: ['admin', 'inboundCalls-edit'],
    args: {
      _id: String,
      note: Match.Optional(String),
      firstName: Match.Optional(String),
      lastName: Match.Optional(String),
      telephone: Match.Optional(String),
      topicId: Match.Optional(Match.OneOf(String, null))
    },
    fn: function ({ _id, note, firstName, lastName, telephone, topicId }) {
      const inboundCall = InboundCalls.findOne({ _id })
      if (!inboundCall) {
        throw new Meteor.Error(404, 'Not found')
      }

      const fields = {
        note,
        firstName,
        lastName,
        telephone,
        topicId
      }

      const $set = Object.keys(fields).filter(k => {
        const value = fields[k]
        return (value !== undefined && (typeof value === 'string' ? value.length >= 1 : true))
      }).reduce((acc, key) => ({
        ...acc,
        [key]: fields[key]
      }), {})

      InboundCalls.update({ _id }, {
        $set
      })

      Events.post('inboundCalls/edit', { _id })
    }
  })
