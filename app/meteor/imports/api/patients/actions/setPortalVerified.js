import { Meteor } from 'meteor/meteor'
import { action } from '../../../util/meteor/action'
import { isMobileNumber } from '../../messages/methods/isMobileNumber'

export const setPortalVerified = ({ Patients }) =>
  action({
    name: 'patients/setPortalVerified',
    roles: ['patients', 'media', 'admin'],
    args: {
      patientId: String,
      phone: String
    },
    fn: function ({ patientId, phone }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!isMobileNumber(phone)) {
        throw new Meteor.Error('not-a-mobile-number', 'phone is not a mobile number')
      }

      const patient = Patients.findOne({ _id: patientId })

      if (!patient) {
        throw new Meteor.Error(404, 'Patient not found')
      }

      console.log('[Patients] setPortalVerified', patientId)

      let didSetContactVerified = false

      const newContacts = patient.contacts.map(c => {
        if (c.valueNormalized === phone &&
             !c.noConsent &&
             !c.hasNone &&
             c.channel === 'Phone') {
          didSetContactVerified = true
          return {
            ...c,
            portalVerifiedAt: new Date(),
            portalVerifiedBy: this.userId
          }
        } else {
          return c
        }
      })

      if (!didSetContactVerified) {
        throw new Meteor.Error('contact-not-found', 'did not find supplied number in patients contacts')
      }

      return Patients.update({ _id: patientId }, {
        $set: {
          contacts: newContacts,
          portalVerifiedAt: new Date(),
          portalVerifiedBy: this.userId
        }
      })
    }
  })
