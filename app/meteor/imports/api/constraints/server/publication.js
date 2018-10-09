import { Constraints } from '../'
import { publish } from '../../../util/meteor/publish'

export default () => {
  publish({
    name: 'constraints',
    roles: ['appointments', 'schedules'],
    preload: 1,
    fn: function () {
      return Constraints.find({})
    }
  })
}
