import { publish, publishComposite } from '../../../util/meteor/publish'
import { Consents, Patients, Appointments } from '../../'

export const publication = () => {
  publish({
    name: 'consents',
    roles: ['*'],
    args: {
      patientId: String
    },
    fn: function ({ patientId }) {
      return Consents.find({
        patientId
      })
    }
  })

  publishComposite({
    name: 'consents-pending',
    roles: ['*'],
    fn: function () {
      return {
        find: function () {
          return Consents.find({
            scannedAt: null
          })
        },
        children: [
          {
            find: function (c) {
              return Appointments.find({ _id: c.appointmentId })
            }
          },
          {
            find: function (c) {
              return Patients.find({ _id: c.patientId })
            }
          }
        ]
      }
    }
  })
}
