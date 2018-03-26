import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { parsePatients } from './parsePatient'
import { Patients } from '../../../../patients'

export const eoswinPatients = ({ Importers }) => {
  return new ValidatedMethod({
    name: 'importers/eoswinPatients',

    validate: new SimpleSchema({
      importer: { type: String, optional: true, allowedValues: [ 'eoswinPatients' ] },
      name: { type: String },
      content: { type: String },
      quiet: { type: Boolean, optional: true }
    }).validator(),

    run ({ name, content, quiet }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'not-authorized')
      }

      let patients = parsePatients(content)

      let ids = patients.map(({ patient, action }) => {
        switch (action) {
          case 'insert':
          case 'update':
            Patients.actions.upsert.call({ patient, quiet })
            break
          case 'softRemove':
            // TODO: Add method to soft remove patients
            console.warn('[Importers] eoswinPatients: Not implemented: Requested soft removal of patient', patient.external.id)
            break
          default: throw new Error(`[Importers] eoswinPatients: Unknown action ${action}`)
        }
      })

      if (ids.length === 1) {
        return ids[0]
      } else {
        return ids
      }
    }
  })
}
