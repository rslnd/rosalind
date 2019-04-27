import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { Contact } from '../schema'

export const setContacts = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/setContacts',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patientId: { type: SimpleSchema.RegEx.Id },
      contacts: { type: [Contact] }
    }).validator(),

    run({ patientId, contacts }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const patient = Patients.findOne({ _id: patientId })
      if (patient) {
        Patients.update({ _id: patientId }, {
          $set: {
            contacts
          }
        }, (err) => {
          if (err) { throw err }
          Events.post('patients/setContacts', { patientId })
        })
      } else {
        throw new Meteor.Error(404, 'Patient not found')
      }
    }
  })
}
