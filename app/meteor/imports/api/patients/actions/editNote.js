import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const editNote = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/editNote',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patientId: { type: SimpleSchema.RegEx.Id },
      newNote: { type: String, optional: true }
    }).validator(),

    run ({ patientId, newNote }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const patient = Patients.findOne({ _id: patientId })

      if (patient) {
        Patients.update({ _id: patientId }, {
          $set: {
            note: newNote,
            updatedAt: new Date(),
            updatedBy: this.userId
          }
        })

        Events.post('patients/editNote', { patientId })
      } else {
        throw new Meteor.Error(404, 'Patient not found')
      }

      return patientId
    }
  })
}
