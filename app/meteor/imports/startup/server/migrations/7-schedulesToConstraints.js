import { Migrations } from 'meteor/percolate:migrations'
import { Schedules } from '../../../api/schedules'
import { Constraints } from '../../../api/constraints'

Migrations.add({
  version: 7,

  up: function () {
    const cursor = Schedules.find({ type: 'constraint' })

    cursor.forEach(schedule => {
      let from
      let to

      if (schedule.hourStart && schedule.hourEnd) {
        from = { h: schedule.hourStart, m: 0 }
        to = { h: schedule.hourEnd, m: 59 }
      }

      Constraints.insert({
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

      Schedules.remove({ _id: schedule._id })
    })

    console.log('Migration schedulesToConstraint: processed', cursor.count(), 'constraints')

    return true
  },

  down: function () {
    return true
  }
})
