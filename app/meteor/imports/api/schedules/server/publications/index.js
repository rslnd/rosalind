import { Schedules } from '../../'
import { publish } from '../../../../util/meteor/publish'

export default () => {
  publish({
    name: 'schedules-constraints',
    roles: ['appointments', 'schedules'],
    preload: 1,
    fn: function () {
      return Schedules.find({
        type: 'constraint'
      })
    }
  })
}
