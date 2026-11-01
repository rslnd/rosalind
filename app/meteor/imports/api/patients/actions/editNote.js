import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'

export const editNote = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/editNote',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patientId: { type: SimpleSchema.RegEx.Id },
      newNote: { type: String, optional: true }
    }).validator(),

    async run ({ patientId, newNote }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const patient = await Patients.findOneAsync({ _id: patientId })

      if (patient) {
        await Patients.updateAsync({ _id: patientId }, {
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
