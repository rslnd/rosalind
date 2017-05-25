/* eslint-env mocha */
import { expect } from 'chai'
import moment from 'moment-timezone'
import { buildMessageText, formatDate } from './buildMessageText'

describe('api', () => {
  describe('messages', () => {
    describe('formatDate', () => {
      it('handles locales', () => {
        const date = moment.tz('2016-12-23T16:18:31.265+00:00', 'UTC').toDate()
        const formatted = formatDate('dd., D.M.', date, { locale: 'de-AT' })
        expect(formatted).to.equal('Fr., 23.12.')
      })

      it('displays in client time zone CET', () => {
        const tz = 'Europe/Vienna'
        const date = moment.tz('2016-12-23T14:30:31.265+00:00', 'UTC').toDate()
        const formatted = formatDate('HH:mm', date, { tz, locale: 'de-AT' })
        expect(formatted).to.equal('15:30')
      })

      it('displays in client time zone CEST', () => {
        const tz = 'Europe/Vienna'
        const date = moment.tz('2016-06-23T14:30:31.265+00:00', 'UTC').toDate()
        const formatted = formatDate('HH:mm', date, { tz, locale: 'de-AT' })
        expect(formatted).to.equal('16:30')
      })
    })

    describe('buildMessageText', () => {
      const templates = {
        dayFormat: 'dddd, M/D/Y',
        timeFormat: 'HH:mm',
        text: 'Your appointment is on %day at %time. <3',
        tz: 'UTC',
        locale: 'en-US'
      }

      const payload = {
        date: moment.tz('2016-12-23T16:18:31.265+00:00', 'UTC').toDate()
      }

      it('builds text with UTC', () => {
        const expected = 'Your appointment is on Friday, 12/23/2016 at 16:18. <3'
        expect(buildMessageText(templates, payload)).to.equal(expected)
      })

      it('fails when not all placeholders are substituted', () => {
        expect(() => buildMessageText({
          text: 'this %placeholder is not replaced'
        }, payload)).to.throw('contains remaining placeholders')
      })

      it('fails when text ist too long to fit', () => {
        expect(() => buildMessageText({
          text: 'A very long text would split up the sms message into multiple parts, which we do not want to happen because we would be billed for mutiple messages. Make this string more than 160 characters long to see it throw.'
        }, payload)).to.throw('length')
      })
    })
  })
})
