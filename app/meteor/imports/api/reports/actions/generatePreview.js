import moment from 'moment-timezone'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { dayToDate, daySelector } from '../../../util/time/day'
import { daysForPreview } from '../methods/daysForPreview'
import { generate as generateReport } from '../methods/generate'
import { assertReportsAccess } from '../methods/assertReportsAccess'
import { Users } from '../../users'

export const generatePreview = ({ Calendars, Reports, Appointments, Schedules, Tags, Messages, Users }) => {
  return new ValidatedMethod({
    name: 'reports/generatePreview',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      day: { type: Object, blackbox: true },
      accessToken: { type: String, optional: true }
    }).validator(),

    async run({ day, accessToken }) {
      try {
        if (this.isSimulation) { return }
        await assertReportsAccess({ userId: this.userId, connection: this.connection, accessToken })

        const calendars = await Calendars.find({}, { sort: { order: 1 } }).fetchAsync()

        // Filter out hacky hidden/assistance users
        const allowedAssigneeIds = (await Users.find({
          employee: { $ne: false },
          hiddenInReports: { $ne: true }
        }).fetchAsync()).map(u => u._id)

        return await Promise.all(calendars.map(async calendar => {
          const calendarId = calendar._id

          const days = await Promise.all(daysForPreview(dayToDate(day)).map(async day => {
            const date = moment(dayToDate(day))

            // TODO: Dry up, merge with generate action
            let appointments = await Appointments.find({
              calendarId,
              assigneeId: { $in: allowedAssigneeIds },
              removed: { $ne: true },
              start: {
                $gt: date.startOf('day').toDate(),
                $lt: date.endOf('day').toDate()
              }
            }).fetchAsync()

            const daySchedule = await Schedules.findOneAsync({
              calendarId,
              type: 'day',
              removed: { $ne: true },
              ...daySelector(day)
            })
            if (daySchedule) {
              daySchedule.userIds = daySchedule.userIds.filter(_id => allowedAssigneeIds.includes(_id))
            }

            let overrideSchedules = await Schedules.find({
              calendarId,
              type: 'override',
              removed: { $ne: true },
              userId: { $in: allowedAssigneeIds },
              start: {
                $gt: date.startOf('day').toDate(),
                $lt: date.endOf('day').toDate()
              }
            }).fetchAsync()

            const appointmentIds = appointments.map(a => a._id)
            const messages = await Messages.find({
              appointmentId: { $in: appointmentIds }
            }).fetchAsync()

            const tagMapping = await Tags.methods.getMappingForReports()

            const existingReport = await Reports.findOneAsync({
              calendarId,
              ...daySelector(day)
            })

            if (existingReport) {
              return existingReport
            } else {
              const generatedPreview = generateReport({ calendar, day, appointments, daySchedule, overrideSchedules, tagMapping, messages })
              return generatedPreview
            }
          }))

          return {
            days,
            calendarId
          }
        }))
      } catch (e) {
        console.error(e.message, e.stack)
        throw e
      }
    }
  })
}
