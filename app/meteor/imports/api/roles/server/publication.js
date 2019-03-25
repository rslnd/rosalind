import { Meteor } from 'meteor/meteor'
import { publish } from '../../../util/meteor/publish'

export default () => {
  publish({
    name: 'roles',
    roles: ['*'],
    fn: function () {
      return Meteor.roles.find({})
    }
  })
}
