import moment from 'moment'
import { Comments } from '../../comments'
import { Patients } from '../../patients'
import Appointments from '../collection'
import { Optional, publishComposite } from '../../../util/meteor/publish'
import { dayToDate } from '../../../util/time/day'
import { hasRole } from '../../../util/meteor/hasRole'

export default () => {
  publishComposite({
    name: 'appointment',
    roles: ['appointments', 'appointments-*'],
    args: {
      appointmentId: String
    },
    fn: function ({ appointmentId }) {
      const userId = this.userId

      return {
        find: function () {
          return Appointments.find({ _id: appointmentId }, {
            limit: 1,
            fields: limitFieldsByRole(userId)
          })
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
    name: 'appointments',
    roles: ['appointments', 'appointments-*'],
    args: {
      appointmentIds: [String]
    },
    fn: function ({ appointmentIds }) {
      const userId = this.userId

      return {
        find: function () {
          return Appointments.find({ _id: { $in: appointmentIds } }, {
            limit: 1,
            fields: limitFieldsByRole(userId)
          })
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
    fn: function ({ appointmentId }) {
      const userId = this.userId
      const startOfToday = moment().startOf('day').toDate()
      const endOfToday = moment().endOf('day').toDate()
      const selector = {
        start: {
          $gte: startOfToday,
          $lte: endOfToday
        }
      }

      return {
        find: function () {
          return Appointments.find(selector, {
            sort: {
              start: -1
            },
            fields: limitFieldsByRole(userId)
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
    name: 'appointments-day',
    roles: ['appointments-*'],
    args: {
      year: Number,
      month: Number,
      day: Number,
      calendarId: String
    },
    fn: function ({ day, month, year, calendarId }) {
      const userId = this.userId
      const date = dayToDate({ day, month, year })
      const selector = {
        calendarId,
        start: {
          $gte: moment(date).startOf('day').toDate(),
          $lte: moment(date).endOf('day').toDate()
        }
      }

      return {
        find: function () {
          return Appointments.find(selector, {
            sort: {
              start: 1
            },
            fields: limitFieldsByRole(userId)
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
    name: 'appointments-patient',
    args: {
      patientId: String,
      page: Optional(Number),
      assigneeId: Optional(String),
      calendarId: Optional(String)
    },
    roles: ['appointments-*'],
    fn: function ({ patientId, page = 0, assigneeId, calendarId }) {
      const userId = this.userId
      const pageSize = 20

      return {
        find: function () {
          return Patients.find({ _id: patientId })
        },
        children: [
          {
            find: function (doc) {
              return Comments.find({ docId: doc._id })
            }
          },
          {
            find: function (patient) {
              const selector = { patientId: patient._id }

              if (assigneeId) {
                selector.assigneeId = assigneeId
              }

              if (calendarId) {
                selector.calendarId = calendarId
              }

              const as = Appointments.find(selector, {
                sort: { start: -1 },
                fields: limitFieldsByRole(userId),
                skip: page * pageSize,
                limit: pageSize,
                removed: true
              })

              console.log('pub as', patientId, as.fetch().length, 'page', page, selector)
              return as
            },
            children: [
              {
                find: function (appointment) {
                  return Comments.find({ docId: appointment._id })
                }
              }
            ]
          }
        ]
      }
    }
  })

  publishComposite({
    name: 'appointments-day-removed',
    roles: ['appointments-removed'],
    args: {
      year: Number,
      month: Number,
      day: Number,
      calendarId: String
    },
    fn: function ({ day, month, year, calendarId }) {
      const userId = this.userId
      const date = dayToDate({ day, month, year })
      const selector = {
        calendarId,
        start: {
          $gte: moment(date).startOf('day').toDate(),
          $lte: moment(date).endOf('day').toDate()
        },
        removed: true
      }

      return {
        find: function () {
          return Appointments.find(selector, {
            removed: true,
            sort: {
              start: 1
            },
            fields: limitFieldsByRole(userId)
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
}

const limitFieldsByRole = userId => {
  if (hasRole(userId, ['appointments-note'])) {
    return {} // Publish all fields
  } else {
    return {
      // note: 0
      // TODO: Find other way to publish 'PAUSE' and 'Verlängerung' appointments. Maybe a flag?
    }
  }
}
