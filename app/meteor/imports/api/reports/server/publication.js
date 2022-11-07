import moment from 'moment-timezone'
import { Match } from 'meteor/check'
import { Reports } from '../'
import { isTrustedNetwork } from '../../customer/isTrustedNetwork'
import { publish } from '../../../util/meteor/publish'
import { hasRole } from '../../../util/meteor/hasRole'

export const publication = () => {
  publish({
    name: 'reports',
    roles: ['reports'],
    args: {
      date: Match.Optional(Date),
      from: Match.Optional(Date),
      to: Match.Optional(Date)
    },
    fn: function ({ date, from, to }) {
      const canShowRevenue = hasRole(this.userId, ['reports-showRevenue', 'admin']) || (!this.userId && this.connection && isTrustedNetwork(this.connection.clientAddress))

      const fields = canShowRevenue
        ? Reports.fields.withRevenue
        : Reports.fields.withoutRevenue

      const selectedDate = moment(date || new Date())

      if (!from) {
        from = moment(selectedDate).clone().subtract(1, 'week').toDate()
      }

      if (!to) {
        to = moment(selectedDate).clone().add(1, 'week').toDate()
      }

      return Reports.find({
        'day.date': {
          $gte: from,
          $lte: to
        }
      }, {
        fields,
        sort: {
          'day.date': -1
        }
      })
    }
  })
}
