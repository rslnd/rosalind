import { action } from '../../../util/meteor/action'
import { Match } from 'meteor/check'
import { Events } from '../../events'
import { Meteor } from 'meteor/meteor'

export const updateRoles = ({ Users }) =>
  action({
    name: 'users/updateRoles',
    args: {
      userId: String,
      addedRoles: Match.Maybe([String]),
      removedRoles: Match.Maybe([String])
    },
    roles: ['admin', 'users-edit'],
    fn: async ({ userId, addedRoles, removedRoles }) => {
      const user = Users.findOne({ _id: userId })
      if (!user) { throw new Meteor.Error(404, 'User not found') }
      console.log('[Users] Setting roles for user', userId, addedRoles, removedRoles)
      Events.post('users/updateRoles', { userId, addedRoles, removedRoles }, 'warning')

      Users.update({ _id: userId }, {
        $set: {
          addedRoles,
          removedRoles
        }
      })
    }
  })
