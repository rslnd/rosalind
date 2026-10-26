import identity from 'lodash/identity'
import { Migrations } from 'meteor/percolate:migrations'
import { Appointments } from '../../../api/appointments'
import { Comments } from '../../../api/comments'

const up = async () => {
  const appointments = await Appointments.find({}, { removed: true }).fetchAsync()

  console.log('[Migration]', appointments.length, 'appointments comments to notes')

  let fixedCount = 0
  for (const [i, appointment] of appointments.entries()) {
    if ((i % 1000) === 0) {
      console.log('[Migration] Progress', i, 'of', appointments.length)
    }

    const comments = await Comments.find({ docId: appointment._id }, { sort: { createdAt: 1 } }).fetchAsync()

    if (!comments || comments.length === 0) {
      continue
    }

    const currentNote = appointment.note || ''

    const missingComments = comments.map(c => c.body).filter(c =>
      currentNote.indexOf(c) === -1
    )

    if (missingComments.length === 0) {
      continue
    }

    fixedCount++

    console.log(fixedCount, appointment._id, 'Missing comments')

    const missingText = missingComments.join('\n\n')

    const newNote = [
      currentNote,
      missingText
    ].filter(identity).join('\n\n')

    await Appointments.updateAsync({ _id: appointment._id }, {
      $set: {
        note: newNote
      }
    })
  }

  return true
}

const down = () => {
  return true
}

Migrations.add({
  version: 14,
  up,
  down
})
