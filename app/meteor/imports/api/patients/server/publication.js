import { Patients } from '../'
import { Comments } from '../../comments'
import { Appointments } from '../../appointments'
import { publishComposite } from '../../../util/meteor/publish'

export default () => {
  publishComposite({
    name: 'patients',
    roles: ['patients', 'appointments', 'appointments-*'],
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
          },
          {
            find: function (patient) {
              return Appointments.find({ docId: patient._id })
            },
            children: [
              {
                find: function (appointment) {
                  return Comments.find({ docId: appointment._id })
                }
              }
            ]
          }
        ]
      }
    }
  })
}
