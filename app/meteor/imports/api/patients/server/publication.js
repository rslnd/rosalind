import { Patients } from '../'
import { Comments } from '../../comments'
import { publish } from '../../../util/meteor/publish'

export default () => {
  publish({
    name: 'patients',
    roles: 'patients',
    args: {
      patientIds: [String]
    },
    fn: function ({ patientIds }) {
      return {
        find: function () {
          return Patients.find({ _id: { $in: patientIds } })
        },
        children: [
          {
            find: function (patient) {
              return Comments.find({ docId: patient._id })
            }
          }
        ]
      }
    }
  })
}
