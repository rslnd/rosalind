import moment from 'moment'
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

        Gesamtumsatz: ${currency(report.total.revenue)}
        ÄrztInnen: ${report.total.assignees}
        Neue PatientInnen pro Stunde: ${report.total.patientsNewPerHourScheduled}
      `

      const body = report.assignees.map((assignee, rank) => {
        return dedent`
          Platz ${rank + 1}: ${assignee.id ? Users.findOne(assignee.id).fullNameWithTitle() : 'Assistenz'}
          Umsatz: ${currency(assignee.revenue)}
          Neue PatientInnen pro Stunde: ${assignee.patients.newPerHourScheduled}
          ${assignee.patients.surgeries ? `OPs: ${assignee.patients.surgeries}\n\n` : ''}
        `
      }).join('\n\n')

      const footer = dedent`
        Gratulation!
      `

      const text = [header, body, footer, '\n'].join('\n\n')

      return { title, text }
    }
  })
}
