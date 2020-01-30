import identity from 'lodash/identity'
import { Migrations } from 'meteor/percolate:migrations'
import { Appointments } from '../../../api/appointments'
import { Messages } from '../../../api/messages'
import { Comments } from '../../../api/comments'

const up = () => {
  const messages = Messages.find({
    type: 'intentToCancel'
  }).fetch().filter(m => m.payload && m.payload.appointmentId)
  console.log('Found', messages.length, 'messages with intent to cancel')

  const messagesWithMatchingAppointment = messages.filter(m => Appointments.findOne({ _id: m.payload.appointmentId, canceled: true, canceledBy: null }, { removed: true })).filter(a => a)
  console.log('Found', messagesWithMatchingAppointment.length, 'appointments that were canceled by message')

  messagesWithMatchingAppointment.forEach(message => {
    Appointments.update({
      _id: message.payload.appointmentId
    }, {
      $set: {
        canceledByMessageId: message._id
      }
    })
  })

  return true
}

const down = () => {
  return true
}

Migrations.add({
  version: 15,
  up,
  down
})
