import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { Messages } from '../'

export const publication = () => {
  Meteor.publish('messages-inbound', function () {
    if (this.userId && Roles.userIsInRole(this.userId, [ 'admin' ])) {
      return Messages.find({
        direction: 'inbound'
      }, {
        sort: {
          createdAt: -1
        },
        limit: 200
      })
    }
  })
}
