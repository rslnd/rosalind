import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'

export const toggleGender = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/toggleGender',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patientId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    async run ({ patientId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const patient = await Patients.findOneAsync({ _id: patientId })

      let newGender = 'Female'

      if (patient.gender === 'Female') {
        newGender = 'Male'
      }

      console.log('[Patients] toggleGender: Setting gender of patient', patientId)

      await Patients.updateAsync({ _id: patientId }, {
        $set: {
          gender: newGender,
          updatedAt: new Date(),
          updatedBy: this.userId
        }
      })
    }
  })
}
