import moment from 'moment'
import { Match } from 'meteor/check'
import { Comments } from '../../comments'
import { Patients } from '../../patients'
import Appointments from '../collection'
import { publishComposite } from '../../../util/meteor/publish'

export default () => {
  publishComposite({
    name: 'appointment',
    roles: ['appointments-*'],
    args: {
      appointmentId: String
    },
    fn: function ({ appointmentId }) {
      return {
        find: function () {
          return Appointments.find({ _id: appointmentId }, { limit: 1 })
        },
        children: [
          {
            find: function (doc) {
              return Comments.find({ docId: doc._id })
            }
          }, {
            find: function (doc) {
              if (doc.patientId) {
                return Patients.find({ _id: doc.patientId }, { limit: 1 })
              }
            }
          }
        ]
      }
    }
  })

  publishComposite({
    name: 'appointments-today',
    roles: ['waitlist', 'appointments-*'],
    preload: true,
    fn: function ({ appointmentId }) {
      const startOfToday = moment().startOf('day').toDate()
      const endOfToday = moment().endOf('day').toDate()

      return {
        find: function () {
          return Appointments.find({
            start: {
              $gt: startOfToday,
              $lt: endOfToday
            }
          }, {
            sort: {
              start: 1
            }
          })
        },
        children: [
          {
            find: function (doc) {
              if (doc.patientId) {
                return Patients.find({ _id: doc.patientId }, {
                  limit: 1
                })
              }
            }
          }
        ]
      }
    }
  })

  publishComposite({
    name: 'appointments-future',
    roles: ['appointments-*'],
    preload: true,
    fn: function () {
      const startOfTomorrow = moment().endOf('day').toDate()

      return {
        find: function () {
          return Appointments.find({
            start: {
              $gt: startOfTomorrow
            }
          }, {
            fields: {
              _id: 1,
              calendarId: 1,
              patientId: 1,
              assigneeId: 1,
              waitlistAssigneeId: 1,
              tags: 1,
              start: 1,
              end: 1,
              admitted: 1,
              treated: 1,
              canceled: 1,
              note: 1,
              lockedBy: 1
            },
            sort: {
              start: 1
            }
          })
        },
        children: [
          {
            find: function (doc) {
              if (doc.patientId) {
                return Patients.find({ _id: doc.patientId }, {
                  limit: 1,
                  fields: Patients.fields.preload
                })
              }
            }
          }
        ]
      }
    }
  })

  publishComposite({
    name: 'appointments-patient',
    args: {
      patientId: String
    },
    roles: ['appointments-*'],
    fn: function ({ patientId }) {
      return {
        find: function () {
          return Appointments.find({ patientId }, {
            sort: { start: 1 },
            removed: true
          })
        },
        children: [
          {
            find: function (appointment) {
              return Comments.find({ docId: patientId })
            }
          }, {
            find: function (appointment) {
              return Comments.find({ docId: appointment._id })
            }
          }
        ]
      }
    }

  })

  // LEGACY
  publishComposite({
    name: 'appointments-legacy',
    args: {
      date: Match.Optional(Date),
      start: Match.Optional(Date),
      end: Match.Optional(Date),
      within: Match.Optional(String)
    },
    roles: ['appointments-*'],
    preload: 1,
    fn: function ({ date, start, end, within }) {
      // If no argument are supplied, publish future appointments
      if (!within) {
        within = 'day'
      }

      if (!start && !end && !date) {
        start = moment().startOf(within).toDate()
        end = moment().add(6, 'months').endOf(within).toDate()
      } else if (date) {
        start = moment(date).startOf(within).toDate()
        end = moment(date).endOf(within).toDate()
      }

      return {
        find: function () {
          const selector = {
            start: {
              $gte: start,
              $lte: end
            },
            removed: { $ne: true }
          }

          return Appointments.find(selector, { sort: { start: 1 } })
        },
        children: [
          {
            find: function (appointment) {
              return Comments.find({ docId: appointment._id })
            }
          },
          {
            find: function (appointment) {
              if (appointment.patientId) {
                return Patients.find({ _id: appointment.patientId }, { limit: 1 })
              }
            }
          }
        ]
      }
    }
  })
}
