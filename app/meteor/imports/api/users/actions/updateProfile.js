import { Meteor } from 'meteor/meteor'
import { Match } from 'meteor/check'
import { action } from '../../../util/meteor/action'
import { Events } from '../../events'

export const updateProfile = ({ Users }) =>
  action({
    name: 'users/updateProfile',
    args: {
      userId: String,
      username: Match.Optional(Match.Maybe(String)),
      lastName: Match.Optional(Match.Maybe(String)),
      firstName: Match.Optional(Match.Maybe(String)),
      titlePrepend: Match.Optional(Match.Maybe(String)),
      titleAppend: Match.Optional(Match.Maybe(String)),
      employee: Match.Optional(Match.Maybe(Boolean)),
      hiddenInReports: Match.Optional(Match.Maybe(Boolean)),
      groupId: Match.Optional(Match.Maybe(String)),
      allowedClientIds: Match.Optional(Match.Maybe([String])),
      external: Match.Optional(Match.Maybe(Object))
    },
    roles: ['admin', 'users-edit'],
    fn: async (args) => {
      const { userId, ...fields } = args

      const user = Users.findOne({ _id: userId }, { removed: true })
      if (!user) {
        throw new Meteor.Error(404, 'User not found')
      }

      Events.post('user/update', { userId })

      return Users.update({ _id: userId }, {
        $set: fields
      })
    }
  })
