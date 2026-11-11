/* eslint-env mocha */
import { expect } from 'chai'
import moment from 'moment-timezone'
import { dayStatus, sendAt, SETTLE_MS } from './dayFinished'

const day = { year: 2026, month: 11, day: 11 }
const at = (hhmm) => moment.tz(`2026-11-11 ${hhmm}`, 'Europe/Vienna').toDate()

const appt = (start, end, extra = {}) => ({ start: at(start), end: at(end), calendarId: 'c1', ...extra })

describe('reports', () => {
  describe('dayStatus', () => {
    it('is open while a patient is still waiting', () => {
      const appointments = [
        appt('09:00', '09:30', { admittedAt: at('09:00'), treatmentStart: at('09:05'), treatmentEnd: at('09:25') }),
        appt('15:00', '15:30', { admittedAt: at('15:00') })
      ]
      expect(dayStatus({ appointments, day, now: at('15:40') }).finished).to.equal(false)
    })

    it('is open while a patient is in treatment', () => {
      const appointments = [
        appt('15:00', '15:30', { admittedAt: at('15:00'), treatmentStart: at('15:05') })
      ]
      expect(dayStatus({ appointments, day, now: at('16:00') }).finished).to.equal(false)
    })

    it('is finished once the last treatment ended', () => {
      const appointments = [
        appt('09:00', '09:30', { admittedAt: at('09:00'), treatmentStart: at('09:05'), treatmentEnd: at('09:25') }),
        appt('15:00', '15:30', { admittedAt: at('15:00'), treatmentStart: at('15:05'), treatmentEnd: at('15:35') })
      ]
      const status = dayStatus({ appointments, day, now: at('15:40') })
      expect(status.finished).to.equal(true)
      expect(status.reason).to.equal('done')
      expect(status.finishedAt.getTime()).to.equal(at('15:35').getTime())
      expect(sendAt(status)).to.equal(at('15:35').getTime() + SETTLE_MS)
    })

    it('waits a few hours for a patient who did not show up', () => {
      const appointments = [
        appt('09:00', '09:30', { admittedAt: at('09:00'), treatmentStart: at('09:05'), treatmentEnd: at('09:25') }),
        appt('15:00', '15:30')
      ]
      expect(dayStatus({ appointments, day, now: at('16:00') }).finished).to.equal(false)
      expect(dayStatus({ appointments, day, now: at('17:31') }).finished).to.equal(true)
    })

    it('settles an explicit no-show right away', () => {
      const appointments = [
        appt('15:00', '15:30', { noShow: true, noShowAt: at('15:45') })
      ]
      const status = dayStatus({ appointments, day, now: at('15:50') })
      expect(status.finished).to.equal(true)
      expect(status.finishedAt.getTime()).to.equal(at('15:45').getTime())
    })

    it('treats check-in as done in calendars where admitted is treated', () => {
      const appointments = [appt('15:00', '15:30', { admittedAt: at('15:02') })]
      const calendarsById = { c1: { admittedIsTreated: true } }
      expect(dayStatus({ appointments, calendarsById, day, now: at('15:10') }).finished).to.equal(true)
    })

    it('ignores canceled appointments', () => {
      const appointments = [
        appt('09:00', '09:30', { admittedAt: at('09:00'), treatmentStart: at('09:05'), treatmentEnd: at('09:25') }),
        appt('15:00', '15:30', { canceled: true })
      ]
      const status = dayStatus({ appointments, day, now: at('10:00') })
      expect(status.finished).to.equal(true)
      expect(status.finishedAt.getTime()).to.equal(at('09:25').getTime())
    })

    it('always ends at 22:00', () => {
      const appointments = [appt('20:00', '20:30', { admittedAt: at('20:00') })]
      expect(dayStatus({ appointments, day, now: at('21:59') }).finished).to.equal(false)
      const status = dayStatus({ appointments, day, now: at('22:00') })
      expect(status.finished).to.equal(true)
      expect(status.reason).to.equal('cutoff')
      expect(sendAt(status)).to.equal(at('22:00').getTime())
    })

    it('does not end a no-show grace period beyond 22:00', () => {
      const appointments = [appt('20:30', '21:00')]
      const status = dayStatus({ appointments, day, now: at('21:30') })
      expect(status.finished).to.equal(false)
      expect(status.reason).to.equal('cutoff')
    })

    it('waits until the cutoff on days without appointments', () => {
      expect(dayStatus({ appointments: [], day, now: at('12:00') }).finished).to.equal(false)
      expect(dayStatus({ appointments: [], day, now: at('22:00') }).finished).to.equal(true)
    })

    it('is finished for past days and open for future days', () => {
      const appointments = [appt('15:00', '15:30', { admittedAt: at('15:00') })]
      expect(dayStatus({ appointments, day, now: new Date('2026-11-12T08:00:00Z') }).finished).to.equal(true)
      expect(dayStatus({ appointments, day, now: new Date('2026-11-10T08:00:00Z') }).finished).to.equal(false)
    })
  })
})
