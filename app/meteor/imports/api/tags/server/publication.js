import { Tags } from '../'
import { publish } from '../../../util/meteor/publish'

export default () => {
  publish({
    name: 'tags',
    roles: ['*'],
    fn: function () {
      return Tags.find({}, { removed: true })
    }
  })
}
