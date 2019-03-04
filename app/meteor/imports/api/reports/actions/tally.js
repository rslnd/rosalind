import moment from 'moment-timezone'
import flow from 'lodash/fp/flow'
import filter from 'lodash/fp/filter'
import map from 'lodash/fp/map'
import sum from 'lodash/fp/sum'
import mean from 'lodash/fp/mean'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { dayToDate } from '../../../util/time/day'
import { Schedules } from '../../schedules'
import { Timesheets } from '../../timesheets'

export const tally = ({ Reports }) => {
  return new ValidatedMethod({
    name: 'reports/tally',

    validate: new SimpleSchema({
      report: { type: Object, blackbox: true }
    }).validator(),

    run ({ report }) {
      report.total || (report.total = {})

      report.assignees = report.assignees.map((a) => {
        a.hours || (a.hours = {})
        a.patients.newPercentage = 100.0 * a.patients.new / a.patients.total

        if (a.userId) {
          // Scheduled hours
          a.hours.scheduled = Schedules.methods.getScheduledHours({ userId: a.userId, day: report.day })
          if (a.hours.scheduled) {
            a.patients.perHourScheduled = a.patients.total / a.hours.scheduled
            a.patients.newPerHourScheduled = a.patients.new / a.hours.scheduled
          }

          // Actual hours
          const start = moment(dayToDate(report.day)).startOf('day')
          const end = moment(dayToDate(report.day)).endOf('day')
          a.hours.actual = Timesheets.methods.sum({ userId: a.userId, start, end })
          if (a.hours.actual) {
            a.hours.actual = a.hours.actual / 1000 / 60 / 60
            a.patients.perHourActual = a.patients.total / a.hours.actual
            a.patients.newPerHourActual = a.patients.new / a.hours.actual
          }
        }
        return a
      })

      report.total.patientsNewPerHourScheduled = flow(
        filter((a) => a.patients.newPerHourScheduled > 0),
        map((a) => a.patients.newPerHourScheduled),
        mean
      )(report.assignees)

      report.total.patientsNewPerHourActual = flow(
        filter((a) => a.patients.newPerHourActual > 0),
        map((a) => a.patients.newPerHourActual),
        mean
      )(report.assignees)

      report.total.revenue = flow(
        map((a) => a.revenue),
        sum
      )(report.assignees)

      report.total.hoursScheduled = flow(
        map((a) => (a && a.hours && a.hours.scheduled) || 0),
        sum
      )(report.assignees)

      report.total.hoursActual = flow(
        map((a) => (a && a.hours && a.hours.actual) || 0),
        sum
      )(report.assignees)

      report.total.revenuePerAssignee =
        report.total.revenue / report.assignees.length

      report.total.patients = flow(
        map((a) => a.patients.total),
        sum
      )(report.assignees)

      report.total.patientsNew = flow(
        map((a) => a.patients.new),
        sum
      )(report.assignees)

      report.total.assignees = report.assignees.filter((a) => a.userId).length

      return report
    }
  })
}
