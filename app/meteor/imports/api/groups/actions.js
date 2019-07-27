import { action, Match } from '../../util/meteor/action'
import { Meteor } from 'meteor/meteor'

export const actions = ({ Groups }) => ({
  setBaseRoles: action({
    name: 'setBaseRoles',
    args: {
      groupId: String,
      baseRoles: Match.Optional([String])
    },
    roles: ['admin', 'groups-edit'],
    fn: function ({ groupId, baseRoles }) {
      const group = Groups.findOne({ _id: groupId })
      if (!group) { throw new Meteor.Error(404, 'Group not found') }

      if (baseRoles && baseRoles.length >= 1) {
        Groups.update({ _id: groupId }, {
          $set: { baseRoles }
        })
      } else {
        Groups.update({ _id: groupId }, {
          $unset: { baseRoles: 1 }
        })
      }

      console.log('[Groups] setBaseRoles: Changed base roles of group', groupId, 'from', group.baseRoles, '->', baseRoles)
    }
  })
})
