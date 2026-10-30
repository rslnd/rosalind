import flatten from 'lodash/flatten'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Calendars } from '../../calendars'

export const setAgreement = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/setAgreement',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patientId: { type: SimpleSchema.RegEx.Id },
      agreement: { type: String },
      agreed: { type: Boolean }
    }).validator(),

    async run({ patientId, agreement, agreed }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const patient = await Patients.findOneAsync({ _id: patientId })

      if (!patient) {
        throw new Meteor.Error(404, 'Patient not found')
      }

      const possibleAgreements = flatten((await Calendars.find({
        requiredAgreements: { $ne: null }
      }).fetchAsync()).map(c => c.requiredAgreements))

      if (!possibleAgreements.includes(agreement)) {
        throw new Meteor.Error(404, `Agreement ${agreement} is not defined in any calendar`)
      }

      const existingAgreements = patient.agreements || []

      if (agreed) {
        const newAgreements = [
          ...existingAgreements,
          {
            to: agreement,
            agreedAt: new Date(),
            witnessBy: this.userId
          }
        ]

        console.log('[Patients] setAgreement: Setting agreement', agreement, patientId)

        return await Patients.updateAsync({ _id: patientId }, {
          $set: {
            agreements: newAgreements,
            updatedAt: new Date(),
            updatedBy: this.userId
          }
        })
      } else {
        const newAgreements = existingAgreements.filter(a => a.to !== agreement)

        console.log('[Patients] setAgreement: Removing agreement', agreement, patientId)

        return await Patients.updateAsync({ _id: patientId }, {
          $set: {
            agreements: newAgreements,
            updatedAt: new Date(),
            updatedBy: this.userId
          }
        })
      }
    }
  })
}
