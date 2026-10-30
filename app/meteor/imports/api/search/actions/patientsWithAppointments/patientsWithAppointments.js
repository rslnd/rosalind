import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../../util/meteor/callPromiseMixin'
import { parseQuery } from './parseQuery'

export const patientsWithAppointments = ({ Patients, Appointments }) => {
  return new ValidatedMethod({
    name: 'search/patientsWithAppointments',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      query: { type: String },
      // enables fuzzy matching even on short names
      forceNgramMatching: { type: Boolean, optional: true },
      limit: { type: Number, optional: true }
    }).validator(),

    async run ({ query, forceNgramMatching, limit }) {
      try {
        this.unblock()

        if (this.connection && !this.userId) {
          throw new Meteor.Error(403, 'Not authorized')
        }

        let selector

        if (query.match(SimpleSchema.RegEx.Id)) {
          const appt = await Appointments.findOneAsync({ _id: query })

          if (appt && appt.patientId) {
            selector = { _id: appt.patientId }
          } else {
            selector = { _id: query }
          }
        } else if (query === '!banned') { // banned
          selector = { banned: true }
        } else if (query[0] === '!') { // special case: seach notes, return
          return await findNotes({ Appointments, Patients, query })
        } else {
          selector = parseQuery(query, forceNgramMatching)
        }

        if (selector) {
          const patients = await Patients.find(selector, {
            sort: { lastName: 1 },
            limit: limit || 300,
            fields: Patients.fields.search
          }).fetchAsync()

          return {
            query, // repeat to client for ignoring slower reordered responses while typing
            patients: await Promise.all(patients.map(async (patient) => {
              return {
                ...patient,
                appointments: await Appointments.find({ patientId: patient._id }, {
                  sort: { start: -1 },
                  limit: 3
                }).fetchAsync()
              }
            }))
          }
        }
      } catch (e) {
        console.error('[Search] patientsWithAppointments failed')
        console.error(e)
      }
    }
  })
}

const findNotes = async ({ Appointments, Patients, query }) => {
  const searchString = query.substr(1).trim()

  if (searchString && searchString.length >= 2) {
    const appointments = await Appointments.find({
      note: {
        $regex: searchString,
        $options: 'i'
      }
    }, {
      sort: { start: -1 }
    }).fetchAsync()

    const patients = await Patients.find({ _id: { $in: appointments.map(a => a._id)}}).fetchAsync()

    return [
      ...appointments.map(appointment => ({ appointment })),
      ...patients.map(p => ({
        patient,
        appointments: appointments.filter(a => a.patientId === p._id)
      }))
    ]
  } else {
    return null
  }
}
