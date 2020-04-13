import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
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

    run ({ patientId, birthday }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const patient = Patients.findOne({ _id: patientId })
      if (patient) {
        Patients.update({ _id: patientId }, {
          $set: {
            birthday,
            updatedAt: new Date(),
            updatedBy: this.userId
          }
        }, (err) => {
          if (err) { throw err }
          Events.post('patients/setBirthday', { patientId })
        })
      } else {
        throw new Meteor.Error(404, 'Patient not found')
      }
    }
  })
}
