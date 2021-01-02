import moment from 'moment-timezone'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { dayToDate, daySelector } from '../../../util/time/day'
import { daysForPreview } from '../methods/daysForPreview'
import { generate as generateReport } from '../methods/generate'
import { Users } from '../../users'

export const generatePreview = ({ Calendars, Reports, Appointments, Schedules, Tags, Messages, Users }) => {
  return new ValidatedMethod({
    name: 'reports/generatePreview',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      day: { type: Object, blackbox: true }
    }).validator(),

    run({ day }) {
      try {
        if (this.isSimulation) { return }

        const calendars = Calendars.find({}, { sort: { order: 1 } }).fetch()

        // Filter out hacky hidden/assistance users
        const allowedAssigneeIds = Users.find({
          employee: { $ne: false },
          hiddenInReports: { $ne: true }
        }).fetch().map(u => u._id)

        return calendars.map(calendar => {
          const calendarId = calendar._id

          const days = daysForPreview(dayToDate(day)).map(day => {
            const date = moment(dayToDate(day))

            // TODO: Dry up, merge with generate action
            const appointments = Appointments.find({
              calendarId,
              assigneeId: { $in: allowedAssigneeIds },
              removed: { $ne: true },
              start: {
                $gt: date.startOf('day').toDate(),
                $lt: date.endOf('day').toDate()
              }
            }).fetch()

            const daySchedule = Schedules.findOne({
              calendarId,
              type: 'day',
              removed: { $ne: true },
              ...daySelector(day)
            })
            if (daySchedule) {
              daySchedule.userIds = daySchedule.userIds.filter(_id => allowedAssigneeIds.includes(_id))
            }

            const overrideSchedules = Schedules.find({
              calendarId,
              type: 'override',
              removed: { $ne: true },
              userId: { $in: allowedAssigneeIds },
              start: {
                $gt: date.startOf('day').toDate(),
                $lt: date.endOf('day').toDate()
              }
            }).fetch()

            const appointmentIds = appointments.map(a => a._id)
            const messages = Messages.find({
              appointmentId: { $in: appointmentIds }
            }).fetch()

            const tagMapping = Tags.methods.getMappingForReports()

            const existingReport = Reports.findOne({
              calendarId,
              ...daySelector(day)
            })

            if (existingReport) {
              return existingReport
            } else {
              const generatedPreview = generateReport({ calendar, day, appointments, daySchedule, overrideSchedules, tagMapping, messages })
              return generatedPreview
            }
          })

          return {
            days,
            calendarId
          }
        })
      } catch (e) {
        console.error(e.message, e.stack)
        throw e
      }
    }
  })
}
