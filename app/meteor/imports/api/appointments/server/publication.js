import moment from 'moment'
import { Comments } from '../../comments'
import { Patients } from '../../patients'
import Appointments from '../collection'
import { publishComposite } from '../../../util/meteor/publish'
import { dayToDate } from '../../../util/time/day'

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
    fn: function ({ appointmentId }) {
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
    name: 'appointments-day',
    roles: ['appointments-*'],
    args: {
      year: Number,
      month: Number,
      day: Number,
      calendarId: String
    },
    fn: function ({ day, month, year, calendarId }) {
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
    name: 'appointments-patient',
    args: {
      patientId: String
    },
    roles: ['appointments-*'],
    fn: function ({ patientId }) {
      return {
        find: function () {
          return Patients.find({ _id: patientId })
        },
        children: [
          {
            find: function (patient) {
              return Appointments.find({ patientId: patient._id }, {
                sort: { start: 1 },
                removed: true
              })
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
}
