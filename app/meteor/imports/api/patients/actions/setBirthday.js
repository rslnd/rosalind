import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'
import { Day } from '../../../util/schema/day'

export const setBirthday = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/setBirthday',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patientId: { type: SimpleSchema.RegEx.Id },
      birthday: { type: Day }
    }).validator(),

    async run ({ patientId, birthday }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const patient = await Patients.findOneAsync({ _id: patientId })
      if (patient) {
        await Patients.updateAsync({ _id: patientId }, {
          $set: {
            birthday,
            updatedAt: new Date(),
            updatedBy: this.userId
          }
        })
        Events.post('patients/setBirthday', { patientId })
      } else {
        throw new Meteor.Error(404, 'Patient not found')
      }
    }
  })
}
