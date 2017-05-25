import { constraints } from './constraints'
import { isTrustedNetwork } from '../../../customer/server/isTrustedNetwork'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'

const hasRoles = ({ userId }) => (
  userId && Roles.userIsInRole(userId, ['appointments', 'schedules', 'admin'], Roles.GLOBAL_GROUP)
)

const isTrusted = ({ connection }) => (
  connection && isTrustedNetwork(connection.clientAddress)
)

const validate = (publication) => {
  return function (params) {
    const args = {
      userId: this.userId,
      connection: this.connection,
      publication,
      params
    }

    if (hasRoles(args) || isTrusted(args)) {
      return publication(params)
    }
  }
}

export default () => {
  Meteor.publish('schedules-constraints', validate(constraints))
}
