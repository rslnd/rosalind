import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const setMessagePreferences = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/setMessagePreferences',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patientId: { type: SimpleSchema.RegEx.Id },
      noSMS: { type: Boolean, optional: true },
      noCall: { type: Boolean, optional: true }
    }).validator(),

    run ({ patientId, noSMS, noCall }) {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      let update = {}
      if (noSMS !== undefined) { update['noSMS'] = noSMS }
      if (noCall !== undefined) { update['noCall'] = noCall }

      if (Object.keys(update).length > 0) {
        Patients.update(
          { _id: patientId },
          {
            $set: {
              ...update,
              updatedAt: new Date(),
              updatedBy: this.userId
            }
          }
        )
      }

      Events.post('patients/setMessagePreferences', { patientId, noSMS, noCall })
    }
  })
}
