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
      query: { type: String }
    }).validator(),

    run ({ query }) {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const selector = parseQuery(query)

      if (selector) {
        const patients = Patients.find(selector, {
          sort: { 'profile.lastName': 1 },
          limit: 100,
          fields: {
            '_id': 1,
            'profile.lastName': 1,
            'profile.firstName': 1,
            'profile.gender': 1,
            'profile.birthday': 1
          }
        }).fetch()

        return patients.map((patient) => {
          return {
            ...patient,
            appointments: Appointments.find({ patientId: patient._id }, {
              sort: { start: -1 },
              limit: 5,
              fields: {
                '_id': 1,
                'tags': 1,
                'start': 1,
                'end': 1,
                'assigneeId': 1,
                'admitted': 1,
                'treated': 1,
                'canceled': 1
              }
            }).fetch() }
        })
      }
    }
  })
}
