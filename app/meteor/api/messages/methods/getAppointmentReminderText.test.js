/* eslint-env mocha */
import { expect } from 'chai'
import moment from 'moment'
import { getAppointmentReminderText, formatDate } from './getAppointmentReminderText'

describe('api', () => {
  describe('messages', () => {
    describe('formatDate', () => {
      it('handles locales', () => {
        const date = new Date(2016, 11, 23, 14, 30)
        const formatted = formatDate('dd., D.M.', date, { locale: 'de-AT' })
        expect(formatted).to.equal('Fr., 23.12.')
      })

      it('displays in client time zone', () => {
        const tz = 'Vienna/Austria'
        const date = new Date(2016, 11, 23, 14, 30)
        const formatted = formatDate('HH:mm', date, { tz, locale: 'de-AT' })
        expect(formatted).to.equal('13:30')
      })
    })

    describe('getAppointmentReminderText', () => {
      it('builds text with UTC', () => {
        const templates = {
          dayFormat: 'dddd, M/D/Y',
          timeFormat: 'HH:mm',
          body: 'Your appointment is on %day at %time.',
          footer: '<3',
          tz: 'UTC',
          locale: 'en-US'
        }

        const payload = {
          start: moment.tz('2016-12-23T16:18:31.265+00:00', 'UTC').toDate()
        }

        const expected = 'Your appointment is on Friday, 12/23/2016 at 16:18. <3'

        expect(getAppointmentReminderText(templates, payload)).to.equal(expected)
      })
    })
  })
})
