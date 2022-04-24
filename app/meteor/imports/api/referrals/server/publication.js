import { Referrals, Referrables } from '../'
import { publish } from '../../../util/meteor/publish'

export const publication = () => {
  publish({
    name: 'referrables',
    roles: ['*'],
    fn: function () {
      return Referrables.find({})
    }
  })

  publish({
    name: 'referrals',
    args: {
      patientIds: [String]
    },
    roles: ['*'],
    fn: function ({ patientIds }) {
      return Referrals.find({
        patientId: {
          $in: patientIds
        }
      })
    }
  })
}
