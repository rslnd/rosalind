import identity from 'lodash/identity'
import { Migrations } from 'meteor/percolate:migrations'
import { Appointments } from '../../../api/appointments'
import { Messages } from '../../../api/messages'
import { Comments } from '../../../api/comments'

const up = async () => {
  const messages = (await Messages.find({
    type: 'intentToCancel'
  }).fetchAsync()).filter(m => m.payload && m.payload.appointmentId)
  console.log('Found', messages.length, 'messages with intent to cancel')

  const withAppointment = await Promise.all(messages.map(async m => ({
    message: m,
    matchingAppointment: await Appointments.findOneAsync({ _id: m.payload.appointmentId, canceled: true, canceledBy: null }, { removed: true })
  })))
  const messagesWithMatchingAppointment = withAppointment.filter(x => x.matchingAppointment).map(x => x.message)
  console.log('Found', messagesWithMatchingAppointment.length, 'appointments that were canceled by message')

  for (const message of messagesWithMatchingAppointment) {
    await Appointments.updateAsync({
      _id: message.payload.appointmentId
    }, {
      $set: {
        canceledByMessageId: message._id
      }
    })
  }

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
