import { Patients } from '../'
import { publish } from '../../../util/meteor/publish'

const nameFields = {
  lastName: 1,
  firstName: 1,
  gender: 1,
  titlePrepend: 1,
  titleAppend: 1,
  birthday: 1
}

export default () => {
  // Caution: this publication is only used by iOS native scanner/capture app
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
        fields: nameFields
      })
    }
  })

  publish({
    name: 'patients-name',
    args: {
      patientIds: [String]
    },
    roles: ['inboundCalls', 'patients', 'admin'],
    fn: function({ patientIds }) {
      return Patients.find({
        _id: { $in: patientIds }
      }, {
        fields: nameFields
      })
    }
  })
}
