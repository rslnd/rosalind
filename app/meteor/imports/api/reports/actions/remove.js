import { Meteor } from 'meteor/meteor'
import moment from 'moment-timezone'
import { dayToDate, daySelector } from '../../../util/time/day'
import { action } from '../../../util/meteor/action'
import { hasRole } from '../../../util/meteor/hasRole'

export const remove = ({ Reports, Events }) => {
  return action({
    name: 'reports/remove',
    args: {
      day: Object
    },
    allowAnonymous: true,
    fn ({ day }) {
      if (this.isSimulation) { return }
      if (Meteor.isServer) {
        const { isTrustedNetwork } = require('../../customer/isTrustedNetwork')
        if (!this.userId && (this.connection && !isTrustedNetwork(this.connection.clientAddress))) {
          throw new Meteor.Error(403, 'Not authorized')
        }
      }

      if (!hasRole(this.userId, ['admin', 'reports'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const date = moment(dayToDate(day))

      const result = Reports.remove({
        ...daySelector(day)
      })

      console.log('[reports] remove: removed reports for', date, result)

      Events.post('reports/remove', { day: day })
    }
  })
}
