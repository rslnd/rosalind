import { Meteor } from 'meteor/meteor'
import { action } from '../../../util/meteor/action'
import { Events } from '../../events'

export const setPasswordless = ({ Users }) =>
  action({
    name: 'users/setPasswordless',
    args: {
      userId: String,
      passwordless: Boolean
    },
    roles: ['admin', 'users-edit'],
    fn: async ({ userId, passwordless }) => {
      const user = await Users.findOneAsync({ _id: userId }, { removed: true })

      if (!user) {
        throw new Meteor.Error(404, 'User not found')
      }

      await Users.updateAsync({ _id: userId }, {
        $set: {
          'services.passwordless': passwordless
        }
      })

      Events.post('users/setPasswordless', { userId, passwordless }, 'warning')
    }
  })
