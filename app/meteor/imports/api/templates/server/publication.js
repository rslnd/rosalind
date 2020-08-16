import { publish } from '../../../util/meteor/publish'
import { Templates } from '../../templates'
import { hasRole } from '../../../util/meteor/hasRole'

export default () => {
  publish({
    name: 'templates',
    roles: ['*'],
    fn: function () {
      return Templates.find({})
    }
  })
}
