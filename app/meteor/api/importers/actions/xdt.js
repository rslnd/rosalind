import Xdt from 'xdt'
import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { dateToDay } from 'util/time/day'
import { Patients } from 'api/patients'

export const xdt = ({ Importers }) => {
  return new ValidatedMethod({
    name: 'importers/xdt',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      importer: { type: String, optional: true, allowedValues: [ 'xdt' ] },
      name: { type: String },
      content: { type: String }
    }).validator(),

    run ({ name, content }) {
      if (!Meteor.userId()) { return }

      const timezone = 'Europe/Vienna'
      const parsed = new Xdt(content)

      if (parsed.patient) {
        const patient = {
          profile: {
            firstName: parsed.patient.firstName,
            lastName: parsed.patient.lastName,
            birthday: dateToDay(moment.tz(parsed.patient.birthday, 'DDMMYYYY', timezone)),
            gender: parsed.patient.gender === '1' ? 'Male' : 'Female'
          },
          external: {
            eoswin: {
              id: parsed.patient.id
            }
          }
        }

        console.log('[Importers] Xdt', { patient: parsed.patient })
        return Patients.actions.upsert.call({ patient })
      } else {
        console.error('[Importers] Xdt: Failed to parse patient', parsed)
        throw new Meteor.Error(500, '[Importers] Xdt: Failed to parse patient')
      }
    }
  })
}
