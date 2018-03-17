import { publish } from '../../../util/meteor/publish'
import { Groups } from '../'

export const publication = () => {
  publish({
    name: 'groups',
    roles: ['appointments', 'users', 'reports'],
    preload: true,
    fn: function () {
      return Groups.find({})
    }
  })
}
