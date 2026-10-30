import { Migrations } from 'meteor/percolate:migrations'
import { Schedules } from '../../../api/schedules'
import { Constraints } from '../../../api/constraints'

Migrations.add({
  version: 7,

  up: async function () {
    const cursor = Schedules.find({ type: 'constraint' })

    for await (const schedule of cursor) {
      let from
      let to

      if (schedule.hourStart && schedule.hourEnd) {
        from = { h: schedule.hourStart, m: 0 }
        to = { h: schedule.hourEnd, m: 59 }
      }

      await Constraints.insertAsync({
        assigneeIds: [schedule.userId],
        from,
        to,
        calendarId: schedule.calendarId,
        tags: schedule.tags,
        note: schedule.note,
        noteDetails: schedule.noteDetails,
        weekdays: schedule.weekdays,
        duration: schedule.duration
      })

      await Schedules.removeAsync({ _id: schedule._id })
    }

    console.log('Migration schedulesToConstraint: processed', await cursor.countAsync(), 'constraints')

    return true
  },

  down: function () {
    return true
  }
})
