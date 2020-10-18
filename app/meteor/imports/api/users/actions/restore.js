import { Meteor } from 'meteor/meteor'
import { action } from '../../../util/meteor/action'
import { Events } from '../../events'

export const restore = ({ Users }) =>
  action({
    name: 'users/restore',
    args: {
      userId: String
    },
    roles: ['admin', 'users-edit'],
    fn: async ({ userId }) => {
      const user = Users.findOne({ _id: userId, removed: true }, { removed: true })

      if (!user) {
        throw new Meteor.Error(404, 'User not found')
      }

      const previousUsername = user.username
        .replace(/deleted/i, '')
        .replace(/removed\d+/i, '')

      Users.update({ _id: userId }, {
        $set: {
          username: previousUsername,
          employee: true,
        },
        $unset: {
          removed: 1,
          removedAt: 1,
          removedBy: 1
        }
      })

      Events.post('users/restore', { userId }, 'warning')
    }
  })
