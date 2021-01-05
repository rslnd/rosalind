import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { parseQuery } from './parseQuery'

export const patientsWithAppointments = ({ Patients, Appointments }) => {
  return new ValidatedMethod({
    name: 'search/patientsWithAppointments',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      query: { type: String },
      // enables fuzzy matching even on short names
      forceNgramMatching: { type: Boolean, optional: true }
    }).validator(),

    run ({ query, forceNgramMatching }) {
      try {
        this.unblock()

        if (this.connection && !this.userId) {
          throw new Meteor.Error(403, 'Not authorized')
        }

        let selector

        if (query.match(SimpleSchema.RegEx.Id)) {
          selector = { _id: query }
        } else if (query === 'banned:true') {
          selector = { banned: true }
        } else {
          selector = parseQuery(query, forceNgramMatching)
        }

        if (selector) {
          const patients = Patients.find(selector, {
            sort: { lastName: 1 },
            limit: 100,
            fields: Patients.fields.search
          }).fetch()

          return patients.map((patient) => {
            return {
              ...patient,
              appointments: Appointments.find({ patientId: patient._id }, {
                sort: { start: -1 },
                limit: 3,
                fields: {
                  '_id': 1,
                  'tags': 1,
                  'start': 1,
                  'end': 1,
                  'assigneeId': 1,
                  'waitlistAssigneeId': 1,
                  'treatmentBy': 1,
                  'admitted': 1,
                  'treated': 1,
                  'canceled': 1
                }
              }).fetch()
            }
          })
        }
      } catch (e) {
        console.error('[Search] patientsWithAppointments failed')
        console.error(e)
      }
    }
  })
}
