import { action, lifecycleActions, Match } from '../../util/meteor/action'
import { Meteor } from 'meteor/meteor'

export const actions = ({ Groups }) => ({
  ...lifecycleActions({
    Collection: Groups,
    singular: 'group',
    plural: 'groups',
    roles: ['admin', 'users-edit']
  }),
  setBaseRoles: action({
    name: 'setBaseRoles',
    args: {
      groupId: String,
      baseRoles: Match.Optional([String])
    },
    roles: ['admin', 'groups-edit'],
    fn: async function ({ groupId, baseRoles }) {
      const group = await Groups.findOneAsync({ _id: groupId })
      if (!group) { throw new Meteor.Error(404, 'Group not found') }

      if (baseRoles && baseRoles.length >= 1) {
        await Groups.updateAsync({ _id: groupId }, {
          $set: { baseRoles }
        })
      } else {
        await Groups.updateAsync({ _id: groupId }, {
          $unset: { baseRoles: 1 }
        })
      }

      console.log('[Groups] setBaseRoles: Changed base roles of group', groupId, 'from', group.baseRoles, '->', baseRoles)
    }
  })
})
