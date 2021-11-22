import moment from 'moment'
import { Messages } from '..'
import { action } from '../../../util/meteor/action'

export const getStats = () =>
  action({
    name: 'messages/getStats',
    roles: ['messages-stats'],
    fn: function () {
      const months = 12
      let acc = []
      for (let i = 0; i <= months; i++) {
        const m = moment.tz(moment(), 'Europe/Vienna').locale('en').subtract(i, 'months')

        const selector = {
          channel: 'SMS',
          createdAt: {
            $gte: m.clone().startOf('month').toDate(),
            $lte: m.clone().endOf('month').toDate()
          }
        }

        const inbound = Messages.find({ ...selector, direction: 'inbound' }).count()
        const outbound = Messages.find({ ...selector, direction: 'outbound' }).count()

        if (inbound > 0 || outbound > 0) {
          acc.push([m.clone().startOf('month').locale('en').format('YYYY-MM'), inbound + outbound, inbound, outbound ])
        }
      }

      console.log('getStats', acc)
      return acc
    }
  })
