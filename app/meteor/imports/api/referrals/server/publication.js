import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Referrals } from '../'
import { Appointments } from '../../appointments'
import { Patients } from '../../patients'

export const publication = () => {
  Meteor.publishComposite('referrals', function (patientIds) {
    check(patientIds, [String])

    if (!this.userId) {
      return
    }

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
  })
}
