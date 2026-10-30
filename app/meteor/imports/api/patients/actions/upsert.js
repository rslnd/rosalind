import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { callNested } from '../../../util/meteor/isInSimulation'

export const upsert = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/shimUpsert',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patient: { type: Object, blackbox: true }
    }).validator(),

    async run({ patient }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Meteor.isServer) {
        const result = await Patients.actions.upsert.callPromise({ patient })
        return result
      }

      return await callNested('patients/upsert', { patient })
    }
  })
}
