import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { Comments } from '../../comments'
import { Calendars } from '../../calendars'
import { hasRole } from '../../../util/meteor/hasRole'

export const insert = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/insert',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointment: { type: Object, blackbox: true },
      newPatient: { type: Object, optional: true, blackbox: true }
    }).validator(),

    run ({ appointment, newPatient }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const userId = this.userId

      this.unblock()

      let patientId = appointment.patientId

      if (newPatient) {
        patientId = Meteor.call('patients/upsert', { patient: newPatient })
      }

      const { note, ...restFields } = appointment

      const calendar = Calendars.findOne({ _id: appointment.calendarId })

      if (!calendar) {
        throw new Meteor.Error('Calendar not found')
      }

      let noteInAppointment = false
      if (note && (
        ((!newPatient && !appointment.patientId) || note === 'PAUSE' || note === 'Verlängerung') ||
        calendar.keepNewAppointmentNote)
      ) {
        restFields.note = note
        noteInAppointment = true
      }

      const appointmentId = Appointments.insert({ ...restFields, patientId })
      
      if (note && !noteInAppointment) {
        Comments.actions.post.callPromise({ docId: appointmentId, body: note })
      }
      Events.post('appointments/insert', { appointmentId })


      if (Meteor.isServer) {
        Appointments.find({
          type: 'bookable',
          start: {$gte: restFields.start },
          end: { $lte: restFields.end },
          calendarId: restFields.calendarId,
          assigneeId: restFields.assigneeId
        }).map(b => {
          Appointments.update({ _id: b._id }, { $set: {
            removed: true,
            removedAt: new Date(),
            removedBy: userId,
            note: 'Gelöscht, weil Termin ausgemacht wurde. Termin: ' + appointmentId + ' \n' + (b.note || '')
          }})
        })
      }

      return appointmentId
    }
  })
}
