import identity from 'lodash/identity'
import { Migrations } from 'meteor/percolate:migrations'
import { Appointments } from '../../../api/appointments'
import { Comments } from '../../../api/comments'

const up = () => {
  const appointments = Appointments.find({}).fetch()

  console.log('[Migration]', appointments.length, 'appointments comments to notes')

  appointments.forEach((appointment, i) => {
    if ((i % 1000) === 0) {
      console.log('[Migration] Progress', i, 'of', appointments.length)
    }

    const comments = Comments.find({ docId: appointment._id }, { sort: { createdAt: 1 } }).fetch()

    if (!comments || comments.length === 0) {
      return
    }

    const text = comments.map(c => c.body).join('\n\n')

    const newNote = [
      appointment.note,
      text
    ].filter(identity).join('\n\n')

    Appointments.update({ _id: appointment._id }, {
      $set: {
        note: newNote,
        noteLegacy: appointment.note
      }
    })
  })

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
