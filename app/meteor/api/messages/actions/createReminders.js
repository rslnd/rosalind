import some from 'lodash/some'
import uniqBy from 'lodash/uniqBy'
import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'
import { Appointments } from 'api/appointments'
import { Patients } from 'api/patients'
import { Users } from 'api/users'

// TODO: Replace with GraphQL
export const findUpcomingAppointments = () => {
  const appointments = Appointments.find({
    start: {
      $gt: moment().add(1, 'day').startOf('day').toDate(),
      $lt: moment().add(1, 'day').toDate()
    }
  }).fetch()

  return appointments.map((appointment) => {
    let patient, contacts

    if (appointment.patientId) {
      patient = Patients.findOne({ _id: appointment.patientId })
      if (patient && patient.profile.contacts) {
        contacts = patient.profile.contacts
      }
    }

    const assigneeName = appointment.assigneeId && Users.findOne({ _id: appointment.assigneeId }).fullNameWithTitle()

    return {
      appointmentId: appointment._id,
      start: appointment.start,
      patient,
      assigneeName,
      contacts
    }
  })
}

export const isMobileNumber = (number) => {
  return true
}

export const createReminders = ({ Messages }) => {
  return new ValidatedMethod({
    name: 'messages/createReminders',
    mixins: [CallPromiseMixin],
    validate: () => {},
    run () {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const appointments = findUpcomingAppointments()
      const appointmentsWithMobile = appointments.filter((a) => {
        if (a.patient && a.patient.profile.contacts) {
          return some(a.patient.profile.contacts, (c) =>
            (c.channel === 'Phone' && isMobileNumber(c.value))
          )
        }
      })
      const uniqueAppointmentsWithMobile = uniqBy(appointmentsWithMobile, (a) => (
        a.patient.profile.contacts[0].value
      ))

      Events.post('messages/createReminders', {
        appointmentsCount: appointments.length,
        appointmentsWithMobileCount: appointmentsWithMobile.length,
        uniqueAppointmentsWithMobileCount: uniqueAppointmentsWithMobile.length
      })
    }
  })
}
