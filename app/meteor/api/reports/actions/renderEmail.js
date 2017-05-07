import moment from 'moment-timezone'
import dedent from 'dedent'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { TAPi18n } from 'meteor/tap:i18n'
import { Users } from 'api/users'

export const renderEmail = ({ Reports }) => {
  const currency = (number) => {
    if (number) {
      return number.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' })
    }
  }

  const __ = (tag) => {
    return TAPi18n.__(tag, {}, 'de-AT')
  }

  return new ValidatedMethod({
    name: 'reports/renderEmail',

    validate: new SimpleSchema({
      report: { type: Object, blackbox: true }
    }).validator(),

    run ({ report }) {
      const title = `${currency(report.total.revenue)} ${__('reports.revenue')}`

      const header = dedent`
        Tagesbericht für ${moment().locale('de-AT').format(__('time.dateFormatWeekday'))}
        Kalenderwoche ${moment().isoWeek()}
      `

      const summary = dedent`
        Gesamtumsatz: ${currency(report.total.revenue)}
        ÄrztInnen: ${report.total.assignees}
        ${report.total.patientsNewPerHourScheduled ? `Neue PatientInnen pro Stunde (laut Plan): ${report.total.patientsNewPerHourScheduled}` : ''}
      `

      const body = report.assignees.map((assignee, rank) => {
        return dedent`
          Platz ${rank + 1}: ${assignee.userId ? Users.findOne(assignee.userId).fullNameWithTitle() : 'Assistenz'}
          Umsatz: ${currency(assignee.revenue)}
          ${assignee.patients.newPerHourScheduled ? `Neue PatientInnen pro Stunde (laut Plan): ${assignee.patients.newPerHourScheduled}` : ''}
          ${assignee.patients.surgeries ? `OPs: ${assignee.patients.surgeries}\n\n` : ''}
        `.replace(/(\n+)/g, '\n')
      }).join('\n\n')

      const footer = dedent`
        Gratulation!

      `

      const text = [header, summary, body, footer].join('\n\n')

      return { title, text }
    }
  })
}
