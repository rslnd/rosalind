import { Referrals } from '../'
import { Appointments } from '../../appointments'
import { Patients } from '../../patients'
import { publishComposite } from '../../../util/meteor/publish'

export const publication = () => {
  publishComposite({
    name: 'referrals',
    args: {
      patientIds: [String]
    },
    roles: ['waitlist', 'waitlist-all', 'waitlist-change'],
    fn: function ({ patientIds }) {
      return {
        find: function () {
          return Referrals.find({
            patientId: {
              $in: patientIds
            }
          })
        },
        children: [
          {
            find: function (doc) {
              return Appointments.find({
                patientId: doc.patientId
              }, {
                fields: {
                  _id: 1,
                  calendarId: 1,
                  patientId: 1,
                  assigneeId: 1,
                  tags: 1,
                  start: 1,
                  end: 1,
                  admitted: 1,
                  treated: 1,
                  canceled: 1
                }
              })
            }
          },
          {
            find: function (doc) {
              return Patients.find({ _id: doc.patientId }, {
                limit: 1,
                fields: Patients.fields.preload
              })
            }
          }
        ]
      }
    }
  })
}
