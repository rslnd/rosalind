import { Migrations } from 'meteor/percolate:migrations'
import { Messages } from '../../../api/messages'

const up = () => {
  const messages = Messages.find({}).fetch()
  console.log('Migrating up to', messages.length, 'messages')

  let i = 0
  messages.forEach(m => {
    if (m.payload.calendarId) {

      Messages.update({
        _id: m._id
      }, {
        $set: {
          calendarId: m.payload.calendarId
        }
      })

      i++

      if (i % 1000 === 0) {
        console.log('Migrated', i, 'of', messages.length, 'messages')
      }
    }
  })

  console.log('Done. Migrated', i, 'messages')

  return true
}

const down = () => {
  return true
}

Migrations.add({
  version: 17,
  up,
  down
})
