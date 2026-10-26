import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'
import { Referrals } from '../../referrals'
import { Messages } from '../../messages'

export const softRemove = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/softRemove',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    async run ({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      // Restore bookable
      const appointment = await Appointments.findOneAsync({
        _id: appointmentId
      })


      await Appointments.updateAsync({ _id: appointmentId }, {
        $set: {
          removed: true,
          removedAt: new Date(),
          removedBy: this.userId
        }
      })

      if (Meteor.isServer) {
        Referrals.serverActions.unredeem({ appointmentId })
        await Messages.actions.removeReminder.callPromise({ appointmentId })

        const previousBookable = await Appointments.findOneAsync({
          type: 'bookable',
          start: appointment.start,
          end: appointment.end,
          calendarId: appointment.calendarId,
          assigneeId: appointment.assigneeId,
        }, { removed: true })

        if (previousBookable) {
          await Appointments.insertAsync({
            type: 'bookable',
            start: appointment.start,
            end: appointment.end,
            calendarId: appointment.calendarId,
            assigneeId: appointment.assigneeId,
            note: 'Wieder freigegeben, nachdem Termin gelöscht wurde. Termin: ' + appointmentId
          })
        }
      }

      Events.post('appointments/softRemove', { appointmentId })

      return appointmentId
    }
  })
}
