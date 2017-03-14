/* eslint-env mocha */
import moment from 'moment'
import { expect } from 'chai'
import { okToSend, statusOk, notExpired } from './okToSend'

describe('api', () => {
  describe('messages', () => {
    describe('okToSend', () => {
      it('true if not already sent', () => {
        expect(statusOk({ status: 'final' })).to.equal(true)
      })

      it('false if already sent', () => {
        expect(statusOk({ status: 'sent' })).to.equal(false)
      })

      it('false if draft', () => {
        expect(statusOk({ status: 'draft' })).to.equal(false)
      })

      it('false if past valid window', () => {
        expect(notExpired({ invalidAfter: new Date(2001) })).to.equal(false)
      })

      it('false if before valid period', () => {
        expect(notExpired({ invalidBefore: new Date(2017) }, moment(2016))).to.equal(false)
      })

      it('true if within valid period', () => {
        expect(notExpired({
          invalidBefore: moment('2017-03-14T11:46:36.224'),
          invalidAfter: moment('2017-03-14T14:46:36.224')
        }, moment('2017-03-14T12:46:36.224'))).to.equal(true)
      })

      it('true if ok to send', () => {
        expect(okToSend({
          direction: 'outbound',
          status: 'final',
          to: '1234567',
          text: 'Hello'
        })).to.equal(true)
      })

      it('false if no message', () => {
        expect(okToSend()).to.equal(false)
      })
    })
  })
})
