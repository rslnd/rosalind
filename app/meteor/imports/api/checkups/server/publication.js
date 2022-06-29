import { Checkups, CheckupsRules } from '../'
import { Comments } from '../../comments'
import { publish, publishComposite, Optional } from '../../../util/meteor/publish'

export default () => {
  publish({
    name: 'checkupsRules',
    roles: ['admin', 'checkups', 'checkups-edit', 'checkups-rules-edit'],
    fn: function () {
      return CheckupsRules.find({})
    }
  })

  publishComposite({
    name: 'checkups',
    roles: ['admin', 'checkups', 'checkups-edit', 'checkups-rules-edit'],
    fn: function () {
      return {
        find: function () {
          return Checkups.find({}, { fields: { file: 0 }})
        },
        children: [
          {
            find: function (cu) {
              return Comments.find({ docId: cu._id })
            }
          }
        ]
      }
    }
  })

  publishComposite({
    name: 'checkup',
    roles: ['admin', 'checkups', 'checkups-edit', 'checkups-rules-edit'],
    args: {
      checkupId: Optional(String)
    },
    fn: function ({ checkupId }) {
      return {
        find: function () {
          return Checkups.find({ _id: checkupsId })
        },
        children: [
          {
            find: function (cu) {
              return Comments.find({ docId: cu._id })
            }
          },
        ]
      }
    }
  })
}
