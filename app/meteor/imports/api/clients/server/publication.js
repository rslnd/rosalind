import { publish } from '../../../util/meteor/publish'
import { Clients } from '../'

export const publication = () => {
  publish({
    name: 'clients',
    roles: ['admin'],
    fn: function () {
      return Clients.find({})
    }
  })
}
