import moment from 'moment-timezone'
import fromPairs from 'lodash/fromPairs'
import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { TAPi18n } from 'meteor/tap:i18n'
import { Reports } from '../../'
import { Events } from '../../../events'
import { Users } from '../../../users'
import { dateToDay, dayToDate, dayToSlug } from '../../../../util/time/day'
import { renderEmail } from '../../methods/renderEmail'
import { renderPdf } from '../../methods/renderPdf'

export const sendEmail = new ValidatedMethod({
  name: 'reports/sendEmail',
  mixins: [CallPromiseMixin],
  validate () {},

  async run (args = {}) {
    if (!this.userId) {
      throw new Meteor.Error(403, 'Not authorized')
    }

    if (!process.env.MAIL_REPORTS_TO ||
      !process.env.MAIL_REPORTS_FROM ||
      !process.env.MAIL_URL) {
      throw new Meteor.Error('env-missing', 'Make sure to set all mail-related environment variables: MAIL_REPORTS_TO, MAIL_REPORTS_FROM, MAIL_URL')
    }

    console.log('[Reports] sendEmail')

    const test = (process.env.NODE_ENV !== 'production')

    const day = args.day || dateToDay(moment(args))
    const report = Reports.findOne({ day })
    const isTodaysReport = moment().isSame(dayToDate(report.day), 'day')
    if (!report || (!test && !isTodaysReport)) {
      throw new Meteor.Error(404, 'There is no report for today, and no email will be sent')
    }

    const userIdToNameMapping = fromPairs(Users.find({}).map(u => [u._id, u.fullNameWithTitle()]))
    const mapAssigneeType = type => TAPi18n.__(`reports.assigneeType__${type}`, null, 'de-AT')
    const mapUserIdToName = userId => userIdToNameMapping[userId]

    const { title, text } = renderEmail({ report, mapUserIdToName, mapAssigneeType })
    const pdf = await renderPdf({ report })
    const filename = `${dayToSlug(day)} Tagesbericht ${process.env.CUSTOMER_NAME}.pdf`

    let recipients = args.to || process.env.MAIL_REPORTS_TO.split(',')

    if (test) {
      const testEmail = 'me+TEST@albertzak.com'
      console.log('[Reports] sendEmail: Overriding recipients because not running in production enviroment', {
        previousRecipients: recipients,
        newRecipients: testEmail
      })
      recipients = testEmail
    }

    Email.send({
      from: process.env.MAIL_REPORTS_FROM,
      to: recipients,
      replyTo: process.env.MAIL_REPORTS_REPLYTO,
      subject: title,
      text,
      attachments: [
        {
          content: pdf,
          filename
        }
      ]
    })

    Events.post('reports/sendEmail', { reportId: report._id })
  }
})
