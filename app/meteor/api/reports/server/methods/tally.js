import _ from 'lodash'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Schedules } from 'api/schedules'

export const tally = new ValidatedMethod({
  name: 'reports/tally',

  validate: new SimpleSchema({
    report: { type: Object, blackbox: true }
  }).validator(),

  run ({ report }) {
    report.total || (report.total = {})

    report.assignees = report.assignees.map((a) => {
      a.hours || (a.hours = {})
      a.patients.newPercentage = 100.0 * a.patients.new / a.patients.total
      a.hours.scheduled = Schedules.methods.getScheduledHours({ userId: a.id, day: report.day })
      a.patients.perHourScheduled = a.patients.total / a.hours.scheduled
      a.patients.newPerHourScheduled = a.patients.new / a.hours.scheduled
      return a
    })

    let ax = _.chain(report.assignees)
      .filter((a) => a.patients.newPerHourScheduled > 0)
      .map((a) => a.patients.newPerHourScheduled)
      .value()
    report.total.patientsNewPerHourScheduled = _.reduce(ax, (a, b) => (a + b), 0.0) / ax.length

    report.total.revenue = _.chain(report.assignees)
      .map((a) => a.revenue)
      .reduce((a, b) => (a + b), 0.0)
      .value()

    report.total.hoursScheduled = _.chain(report.assignees)
      .map((a) => a && a.hours && a.hours.scheduled || 0)
      .reduce((a, b) => (a + b), 0.0)
      .value()

    report.total.revenuePerAssignee =
      report.total.revenue / report.assignees.length

    report.total.patients = _.chain(report.assignees)
      .map((a) => a.patients.total)
      .reduce((a, b) => (a + b), 0.0)
      .value()

    report.total.patientsNew = _.chain(report.assignees)
      .map((a) => a.patients.new)
      .reduce((a, b) => (a + b), 0.0)
      .value()

    report.total.assignees = report.assignees.filter((a) => a.id).length

    return report
  }
})
