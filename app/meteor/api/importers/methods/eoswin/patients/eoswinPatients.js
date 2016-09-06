import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { parsePatients } from './parsePatient'
import { Patients } from 'api/patients'

export const eoswinPatients = ({ Importers }) => {
  return new ValidatedMethod({
    name: 'importers/eoswinPatients',

    validate: new SimpleSchema({
      importer: { type: String, optional: true, allowedValues: [ 'eoswinPatients' ] },
      name: { type: String },
      content: { type: String }
    }).validator(),

    run ({ name, content }) {
      if (!Meteor.userId()) { return }

      let patients = parsePatients(content)

      let ids = patients.map(({ patient, action }) => {
        switch (action) {
          case 'insert':
          case 'update':
            Patients.methods.upsert.call({ patient })
            break
          case 'softRemove':
            // TODO: Add method to soft remove patients
            console.warn('[Importers] eoswinPatients: Not implemented: Requested soft removal of patient', patient)
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
