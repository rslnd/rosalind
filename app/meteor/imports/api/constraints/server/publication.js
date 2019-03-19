import { Constraints } from '../'
import { publish } from '../../../util/meteor/publish'

export default () => {
  publish({
    name: 'constraints',
    roles: ['appointments-*', 'schedules'],
    fn: function () {
      return Constraints.find({ removed: { $ne: true } })
    }
  })
}
