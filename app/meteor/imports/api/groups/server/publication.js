import { publish } from '../../../util/meteor/publish'
import { Groups } from '../'

export const publication = () => {
  publish({
    name: 'groups',
    roles: ['*'],
    fn: function () {
      return Groups.find({})
    }
  })
}
