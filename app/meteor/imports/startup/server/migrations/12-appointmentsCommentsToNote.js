import identity from 'lodash/identity'
import { Migrations } from 'meteor/percolate:migrations'
import { Appointments } from '../../../api/appointments'
import { Comments } from '../../../api/comments'

const up = async () => {
  const appointments = await Appointments.find({}).fetchAsync()

  console.log('[Migration]', appointments.length, 'appointments comments to notes')

  for (const [i, appointment] of appointments.entries()) {
    if ((i % 1000) === 0) {
      console.log('[Migration] Progress', i, 'of', appointments.length)
    }

    const comments = await Comments.find({ docId: appointment._id }, { sort: { createdAt: 1 } }).fetchAsync()

    if (!comments || comments.length === 0) {
      continue
    }

    const text = comments.map(c => c.body).join('\n\n')

    const newNote = [
      appointment.noteLegacy || appointment.note,
      text
    ].filter(identity).join('\n\n')

    await Appointments.updateAsync({ _id: appointment._id }, {
      $set: {
        note: newNote,
        noteLegacy: appointment.note
      }
    })
  }

  return true
}

const down = () => {
  return true
}

Migrations.add({
  version: 12,
  up,
  down
})
