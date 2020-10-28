import moment from 'moment-timezone'
import fromPairs from 'lodash/fromPairs'
import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import { __ } from '../../../../i18n'
import { Reports } from '../../'
import { Calendars } from '../../../calendars'
import { Events } from '../../../events'
import { Users } from '../../../users'
import { dateToDay, dayToDate, dayToSlug, daySelector } from '../../../../util/time/day'
import { renderEmail } from '../../methods/renderEmail'
import { renderPdf } from '../../methods/renderPdf'

export const sendEmail = async (args = {}) => {
  if (!process.env.MAIL_REPORTS_TO ||
    !process.env.MAIL_REPORTS_FROM ||
    !process.env.MAIL_URL) {
    throw new Meteor.Error('env-missing', 'Make sure to set all mail-related environment variables: MAIL_REPORTS_TO, MAIL_REPORTS_FROM, MAIL_URL')
  }

  console.log('[Reports] sendEmail', args)

  try {
    const test = (process.env.NODE_ENV !== 'production') || args.test

    const day = args.day || dateToDay(moment(args))

    const reports = Reports.find({
      ...daySelector(day)
    }).fetch()

    if (reports.length === 0) {
      console.log('[Reports] There are no reports for this day, no email will be sent')
      return
    }

    const isTodaysReport = moment().isSame(dayToDate(day), 'day')
    const isLastWeekReport = moment(dayToDate(day)).isBetween(
      moment().subtract(2, 'weeks').startOf('week'),
      moment().add(1, 'day')
    )
    if (!test && reports.length === 0 && (!isTodaysReport && !isLastWeekReport)) {
      throw new Meteor.Error(404, 'There is no report for this date, or the date is not within the last 2 weeks, and no email will be sent')
    }

    const userIdToNameMapping = fromPairs(Users.find({}).map(u => [u._id, Users.methods.fullNameWithTitle(u)]))
    const mapAssigneeType = type => __(`reports.assigneeType__${type}`, null, 'de-AT')
    const mapUserIdToName = userId => userIdToNameMapping[userId]
    const mapCalendar = calendarId => Calendars.findOne({ _id: calendarId })

    const { title, text } = renderEmail({ reports, mapUserIdToName, mapAssigneeType, mapCalendar })
    const pdf = await renderPdf({ day })

    if (!pdf) {
      throw new Meteor.Error('Failed to generate pdf, not sending email.')
    }

    const filename = [
      dayToSlug(day),
      __('reports.thisDaySingular', null, 'de-AT'),
      process.env.CUSTOMER_NAME
    ].join(' ') + '.pdf'

    let recipients = args.to || process.env.MAIL_REPORTS_TO.split(',')

    if (test) {
      const testEmail = 'me+TEST@albertzak.com'
      console.log('[Reports] sendEmail: Overriding recipients because not running in production enviroment')
      recipients = testEmail
    }

    console.log('[Reports] sendEmail: Sending')

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

    Events.post('reports/sendEmail', { reportIds: reports.map(r => r._id) })
  } catch (e) {
    console.error(e)
    throw e
  }
}
