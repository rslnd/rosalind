import { Meteor } from 'meteor/meteor'
import { action } from '../../../util/meteor/action'
import { Events } from '../../events'

export const unsetPassword = ({ Users }) =>
  action({
    name: 'users/unsetPassword',
    args: {
      userId: String
    },
    roles: ['admin', 'users-edit'],
    fn: async ({ userId, passwordless }) => {
      const user = Users.findOne({ _id: userId })

      if (!user) {
        throw new Meteor.Error(404, 'User not found')
      }

      Users.update({ _id: userId }, {
        $unset: {
          'services.password': 1,
          weakPassword: 1
        }
      })

      Events.post('users/unsetPassword', { userId }, 'warning')
    }
  })
