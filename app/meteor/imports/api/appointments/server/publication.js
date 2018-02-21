import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import { isTrustedNetwork } from '../../customer/server/isTrustedNetwork'
import { Comments } from '../../comments'
import { Patients } from '../../patients'
import Appointments from '../collection'

export default () => {
  Meteor.publishComposite('appointment', function (_id) {
    check(_id, String)

    if (!(this.userId && Roles.userIsInRole(this.userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP))) { return }

    this.unblock()

    return {
      find: function () {
        this.unblock()
        return Appointments.find({ _id }, { limit: 1 })
      },
      children: [
        {
          find: function (doc) {
            this.unblock()
            return Comments.find({ docId: doc._id })
          }
        }, {
          find: function (doc) {
            this.unblock()
            if (doc.patientId) {
              return Patients.find({ _id: doc.patientId }, { limit: 1 })
            }
          }
        }
      ]
    }
  })

  Meteor.publishComposite('appointments-future', function () {
    const isAuthenticated = (this.userId && Roles.userIsInRole(this.userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP))

    if (!(isAuthenticated || (this.connection && isTrustedNetwork(this.connection.clientAddress)))) { return }

    this.unblock()

    const startOfToday = moment().startOf('day').toDate()

    return {
      find: function () {
        this.unblock()
        return Appointments.find({
          start: {
            $gt: startOfToday
          }
        }, {
          fields: {
            _id: 1,
            calendarId: 1,
            patientId: 1,
            assigneeId: 1,
            tags: 1,
            start: 1,
            end: 1,
            admitted: 1,
            treated: 1,
            canceled: 1,
            note: 1
          },
          sort: {
            start: 1
          }
        })
      },
      children: [
        {
          find: function (doc) {
            this.unblock()
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
  })
}
