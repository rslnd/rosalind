import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { action } from '../../../util/meteor/action'
import { Events } from '../../events'

export const remove = ({ Users }) =>
  action({
    name: 'users/remove',
    args: {
      userId: String
    },
    roles: ['admin', 'users-edit'],
    fn: async ({ userId }) => {
      const user = Users.findOne({ _id: userId }, { removed: true})

      if (!user) {
        throw new Meteor.Error(404, 'User not found')
      }

      const date = moment().format('YYYYMMDD')

      Users.update({ _id: userId }, {
        $set: {
          username: user.username + 'Removed' + date,
          employee: false,
          removed: true,
          removedAt: new Date(),
          removedBy: this.userId
        }
      })

      Users.update({ _id: userId }, {
        $unset: {
          services: 1,
          weakPassword: 1
        }
      })

      Events.post('users/remove', { userId }, 'warning')
    }
  })
