import { Patients } from '../'
import { publish } from '../../../util/meteor/publish'

export default () => {
  publish({
    name: 'patient-name',
    requireClientKey: true,
    allowAnonymous: true,
    args: {
      patientId: String
    },
    fn: function ({ patientId }) {
      return Patients.find({
        _id: patientId
      }, {
        fields: {
          lastName: 1,
          firstName: 1,
          gender: 1,
          titlePrepend: 1,
          titleAppend: 1
        }
      })
    }
  })
}
