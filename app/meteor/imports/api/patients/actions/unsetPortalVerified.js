import { Meteor } from 'meteor/meteor'
import { action } from '../../../util/meteor/action'

export const unsetPortalVerified = ({ Patients }) =>
  action({
    name: 'patients/unsetPortalVerified',
    roles: ['patients', 'media', 'admin'],
    args: {
      patientId: String
    },
    fn: function ({ patientId }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const patient = Patients.findOne({ _id: patientId })

      if (!patient) {
        throw new Meteor.Error(404, 'Patient not found')
      }

      console.log('[Patients] unsetPortalVerified', patientId)

      const newContacts = patient.contacts.map(c => {
        const {
          portalVerifiedAt,
          portalVerifiedBy,
          ...rest
        } = c

        return rest
      })

      return Patients.update({ _id: patientId }, {
        $set: {
          contacts: newContacts
        },
        $unset: {
          portalVerifiedAt: 1,
          portalVerifiedBy: 1
        }
      })
    }
  })
