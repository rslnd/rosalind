import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Reports } from 'api/reports'
import { Events } from 'api/events'
import { dateToDay } from 'util/time/day'

export const sendEmail = new ValidatedMethod({
  name: 'reports/sendEmail',

  validate () {
    if (!process.env.MAIL_REPORTS_TO ||
    !process.env.MAIL_REPORTS_FROM ||
    !process.env.MAIL_URL) {
      throw new Meteor.Error('Make sure to set all mail-related environment variables: MAIL_REPORTS_TO, MAIL_REPORTS_FROM, MAIL_URL')
    }
  },

  run () {
    const todaysReport = Reports.findOne({ day: dateToDay(moment()) })

    if (!todaysReport) {
      throw new Meteor.Error('There is no report for today, and no email will be sent')
    }

    const rendered = Reports.methods.renderEmail.call({ report: todaysReport })

    Email.send({
      from: process.env.MAIL_REPORTS_FROM,
      to: process.env.MAIL_REPORTS_TO.split(','),
      replyTo: process.env.MAIL_REPORTS_REPLYTO,
      subject: rendered.title,
      text: rendered.text
    })

    Events.post('reports/email', { reportId: todaysReport._id })
  }
})
