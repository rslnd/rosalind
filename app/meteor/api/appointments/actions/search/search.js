import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const search = ({ Appointments, Patients }) => {
  return new ValidatedMethod({
    name: 'appointments/search',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      query: { type: String }
    }).validator(),

    run ({ query }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const patients = Patients.actions.search.call({ query })
      const patientsWithAppointments = patients.map((patient) => {
        return {
          patient,
          appointments: Appointments.find({
            patientId: patient._id,
            removed: { $ne: true }
          }, {
            sort: { start: -1 },
            limit: 100
          }).fetch()
        }
      })

      return patientsWithAppointments
    }
  })
}
