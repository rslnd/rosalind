import { publish } from '../../../util/meteor/publish'
import { Records } from '../'

export const publication = () => {
  publish({
    name: 'records',
    roles: ['*'],
    args: {
      patientId: String
    },
    fn: function ({ patientId }) {
      return Records.find({ patientId })
    }
  })
}
