import { Migrations } from 'meteor/percolate:migrations'
import { Messages } from '../../../api/messages'

const up = async () => {
  const messages = await Messages.find({}).fetchAsync()
  console.log('Migrating up to', messages.length, 'messages')

  let i = 0
  for (const m of messages) {
    if (m.payload.calendarId) {

      await Messages.updateAsync({
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
  }

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
