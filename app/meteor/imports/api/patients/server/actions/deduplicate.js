import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { deduplicate as merge, perform } from '../../methods/deduplicateWithJournal'
import { hasRole } from '../../../../util/meteor/hasRole'

export const deduplicate = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/deduplicate',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patientIds: { type: [SimpleSchema.RegEx.Id] }
    }).validator(),

    run ({ patientIds }) {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!hasRole(this.userId, ['admin'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const patients = patientIds.map(_id => Patients.findOne({ _id }))

      if (patients.some(p => !p)) {
        throw new Meteor.Error(404, 'Not found')
      }

      // Avoid circular import, this method should probably be inside a third module
      const { Appointments } = require('../../../appointments')
      const actions = merge([patients])
      console.log('Deduplicate will perform', actions)
      perform({ Appointments, Patients, actions })
    }
  })
}