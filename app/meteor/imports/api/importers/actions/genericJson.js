import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Patients } from '../../patients'
import { callNested } from '../../../util/meteor/isInSimulation'

export const genericJson = ({ Importers }) => {
  return new ValidatedMethod({
    name: 'importers/genericJson',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      importer: { type: String, optional: true, allowedValues: [ 'genericJson' ] },
      name: { type: String },
      content: { type: String }
    }).validator(),

    async run ({ name, content }) {
      if (!Meteor.userId()) { return }

      const parsed = JSON.parse(content)

      console.log('[Importers] genericJson: parsing', parsed.length, 'records')

      for (const rawPatient of parsed) {
        try {
          const contacts = []
          if (rawPatient.Email) {
            contacts.push({
              channel: 'Email',
              value: rawPatient.Email
            })
          }

          if (rawPatient.Telefon) {
            contacts.push({
              channel: 'Phone',
              value: rawPatient.Telefon
            })
          }

          if (rawPatient.Faxnr) {
            contacts.push({
              channel: 'Phone',
              value: rawPatient.Faxnr
            })
          }

          const patient = {
            firstName: rawPatient.Vorname,
            lastName: rawPatient.Familienname,
            titlePrepend: rawPatient.Titel,
            insuranceId: rawPatient.SVNr,
            contacts,
            address: {
              line1: rawPatient.Strasse,
              locality: rawPatient.Ort,
              postalCode: rawPatient.PLZ
            },
            external: {
              bioresonanz: {
                id: rawPatient.StammdatenNr,
                timestamps: {
                  importedAt: new Date()
                }
              }
            }
          }

          await callNested('patients/upsert', { patient })
        } catch (e) {
          console.error('[Importers] genericJson: Failed', e)
        }
      }

      console.log('[Importers] genericJson: done')
    }
  })
}
