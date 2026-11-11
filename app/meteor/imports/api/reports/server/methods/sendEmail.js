import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'
import { __ } from '../../../../i18n'
import { Appointments } from '../../../appointments'
import { Calendars } from '../../../calendars'
import { Schedules } from '../../../schedules'
import { Events } from '../../../events'
import { Users } from '../../../users'
import { dateToDay, dayToDate, dayToSlug } from '../../../../util/time/day'
import { computeStatistics } from '../../methods/computeStatistics'
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
    const asOf = moment(dayToDate(day)).endOf('day').toDate()

    const statistics = await computeStatistics({ Appointments, Schedules, Calendars, Users, asOf })

    const { title, text } = renderEmail({ statistics })
    const pdf = await renderPdf({ day })

    if (!pdf) {
      throw new Meteor.Error('Failed to generate pdf, not sending email.')
    }

    const filename = [
      dayToSlug(day),
      __('reports.statisticsTitle', null, 'de-AT'),
      process.env.CUSTOMER_NAME
    ].join(' ') + '.pdf'

    let recipients = args.to || process.env.MAIL_REPORTS_TO.split(',')

    // Optional, comma-separated. Not used for test mails, see below.
    let bcc = process.env.MAIL_REPORTS_BCC
      ? process.env.MAIL_REPORTS_BCC.split(',').map(a => a.trim()).filter(Boolean)
      : undefined

    if (test) {
      const testEmail = 'me+TEST@albertzak.com'
      console.log('[Reports] sendEmail: Overriding recipients because not running in production enviroment')
      recipients = testEmail
      bcc = undefined
    }

    console.log('[Reports] sendEmail: Sending')

    // sendAsync, awaited: Meteor 3's Email.send only forwards to sendAsync and
    // swallows the rejection into console.error, so a failed send still looked
    // like a success here.
    await Email.sendAsync({
      from: process.env.MAIL_REPORTS_FROM,
      to: recipients,
      bcc,
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

    Events.post('reports/sendEmail', { day, test: !!test })
  } catch (e) {
    console.error('caught sendEmail error', e)
    return false
  }
}
