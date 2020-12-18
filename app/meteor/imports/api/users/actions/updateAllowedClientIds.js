import { action } from '../../../util/meteor/action'
import { Match } from 'meteor/check'
import { Events } from '../../events'
import { Meteor } from 'meteor/meteor'

export const updateAllowedClientIds = ({ Users }) =>
  action({
    name: 'users/updateAllowedClientIds',
    args: {
      userId: String,
      allowedClientIds: Match.Maybe([String])
    },
    roles: ['admin', 'users-edit'],
    fn: async ({ userId, allowedClientIds }) => {
      const user = Users.findOne({ _id: userId }, { removed: true })
      if (!user) { throw new Meteor.Error(404, 'User not found') }
      console.log('[Users] Setting allowed client ids for user', userId, allowedClientIds)
      Events.post('users/updateAllowedClientIds', { userId, allowedClientIds }, 'warning')

      Users.update({ _id: userId }, {
        $set: {
          allowedClientIds
        }
      })
    }
  })
