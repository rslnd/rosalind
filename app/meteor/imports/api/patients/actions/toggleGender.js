import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const toggleGender = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/toggleGender',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patientId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ patientId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const patient = Patients.findOne({ _id: patientId })

      let newGender = 'Female'

      if (patient.profile.gender === 'Female') {
        newGender = 'Male'
      }

      console.log('[Patients] toggleGender: Setting gender of patient', patientId, 'to', newGender)

      Patients.update({ _id: patientId }, {
        $set: {
          'profile.gender': newGender
        }
      })
    }
  })
}
