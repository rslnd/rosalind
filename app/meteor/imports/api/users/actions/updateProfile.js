import { Meteor } from 'meteor/meteor'
import { Match } from 'meteor/check'
import { action } from '../../../util/meteor/action'

export const updateProfile = ({ Users }) =>
  action({
    name: 'users/updateProfile',
    args: {
      userId: String,
      username: String,
      lastName: String,
      firstName: Match.Maybe(String),
      titlePrepend: Match.Maybe(String),
      titleAppend: Match.Maybe(String),
      employee: Match.Maybe(Boolean),
      groupId: Match.Maybe(String)
    },
    roles: ['admin', 'users-edit'],
    fn: async (args) => {
      const { userId, ...fields } = args

      const user = Users.findOne({ _id: userId })
      if (!user) {
        throw new Meteor.Error(404, 'User not found')
      }

      return Users.update({ _id: userId }, {
        $set: fields
      })
    }
  })
