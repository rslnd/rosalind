import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import { Reports } from '../'
import { isTrustedNetwork } from '../../customer/server/isTrustedNetwork'

export const publication = () => {
  Meteor.publish('reports', function (args) {
    check(args, Match.Optional({
      date: Match.Optional(Date),
      from: Match.Optional(Date),
      to: Match.Optional(Date)
    }))

    if (!this.userId) { return }
    if (!Roles.userIsInRole(this.userId, ['reports', 'admin'], Roles.GLOBAL_GROUP) ||
      !(this.connection && isTrustedNetwork(this.connection.clientAddress))) { return }

    const canShowRevenue = Roles.userIsInRole(this.userId, ['reports-showRevenue', 'admin'], Roles.GLOBAL_GROUP) || isTrustedNetwork(this.connection.clientAddress)

    const fields = canShowRevenue
      ? Reports.fields.withRevenue
      : Reports.fields.withoutRevenue

    const date = moment(args && args.date || new Date())

    const [from, to] = (args && args.from && args.to)
      ? [args.from, args.to]
      : [
        moment(date).subtract(1, 'week').toDate(),
        moment(date).add(1, 'week').toDate()
      ]

    return Reports.find({
      createdAt: {
        $gte: from,
        $lte: to
      }
    }, { fields })
  })
}
