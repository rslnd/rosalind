import { Tags } from '../'
import { publish } from '../../../util/meteor/publish'

export default () => {
  publish({
    name: 'tags',
    preload: true,
    roles: ['appointments-*', 'system'],
    fn: function () {
      return Tags.find({}, { removed: true })
    }
  })
}
