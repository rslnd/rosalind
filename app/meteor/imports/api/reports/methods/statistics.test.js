/* eslint-env mocha */
import assert from 'assert'
import { computeMetrics, computeScope, isNoShow, isCanceled, isPrivate, isOnline } from './statistics'

const hoursApart = (start, hours) => ({
  start,
  end: new Date(start.getTime() + hours * 60 * 60 * 1000)
})

describe('reports/methods/statistics', function () {
  describe('predicates', function () {
    it('isCanceled reads canceledAt or canceled', function () {
      assert.equal(isCanceled({ canceledAt: new Date() }), true)
      assert.equal(isCanceled({ canceled: true }), true)
      assert.equal(isCanceled({}), false)
    })

    it('isNoShow = not admitted and not canceled', function () {
      assert.equal(isNoShow({}), true)
      assert.equal(isNoShow({ admittedAt: new Date() }), false)
      assert.equal(isNoShow({ canceledAt: new Date() }), false)
    })

    it('isPrivate/isOnline read their flags', function () {
      assert.equal(isPrivate({ privateAppointment: true }), true)
      assert.equal(isPrivate({ privateAppointment: false }), false)
      assert.equal(isOnline({ createdViaPortal: true }), true)
      assert.equal(isOnline({}), false)
    })
  })

  describe('computeMetrics', function () {
    const start = new Date('2026-06-01T08:00:00Z')

    it('counts totals, no-shows and rates', function () {
      const appointments = [
        { ...hoursApart(start, 1), patientId: 'p1', admittedAt: new Date() }, // admitted
        { ...hoursApart(start, 1), patientId: 'p2' }, // no-show
        { ...hoursApart(start, 1), patientId: 'p3', canceledAt: new Date() }, // canceled
        { ...hoursApart(start, 1), patientId: 'p4', createdViaPortal: true }, // online no-show
        { ...hoursApart(start, 1), patientId: 'p5', createdViaPortal: true, admittedAt: new Date(), privateAppointment: true }
      ]

      const m = computeMetrics({ appointments, freeSlots: 5, scheduledHours: 10, slotsUsed: 30, slotsAvailable: 120, workingDays: 5 })

      assert.equal(m.total, 5)
      assert.equal(m.canceled, 1)
      assert.equal(m.expected, 4)
      assert.equal(m.admitted, 2) // p1 and p5 checked in
      assert.equal(m.noShow, 2) // p2 and p4
      assert.equal(m.noShowRate, 2 / 4)
      assert.equal(m.insurance, 4)
      assert.equal(m.private, 1)
      assert.equal(m.online, 2)
      assert.equal(m.onlineNoShow, 1) // p4
      assert.equal(m.onlineNoShowRate, 1 / 2)
      // booked hours = 4 non-canceled * 1h
      assert.equal(m.bookedHours, 4)
      assert.equal(m.timeUtilization, 4 / 10)
      // online slot utilization = online / (online + freeSlots) = 2 / 7
      assert.equal(m.slotUtilization, 2 / 7)
      // calendar slot utilization = used / available
      assert.equal(m.calendarSlotUtilization, 30 / 120)
      // throughput
      assert.equal(m.patientsPerHour, 2 / 10)
      assert.equal(m.admittedPerDay, 2 / 5)
      // billing split present
      assert.equal(m.billing.insurance.total, 4)
      assert.equal(m.billing.private.total, 1)
      assert.equal(m.billing.private.admitted, 1) // p5
    })

    it('guards divisions by zero with null', function () {
      const m = computeMetrics({ appointments: [], freeSlots: 0, scheduledHours: 0, slotsAvailable: 0 })
      assert.equal(m.noShowRate, null)
      assert.equal(m.timeUtilization, null)
      assert.equal(m.slotUtilization, null)
      assert.equal(m.calendarSlotUtilization, null)
      assert.equal(m.patientsPerHour, null)
    })
  })

  describe('computeScope', function () {
    const start = new Date('2026-06-01T08:00:00Z')
    it('splits per assignee and computes a practice total', function () {
      const appointments = [
        { ...hoursApart(start, 1), patientId: 'p1', assigneeId: 'dr-a' },
        { ...hoursApart(start, 1), patientId: 'p2', assigneeId: 'dr-a', admittedAt: new Date() },
        { ...hoursApart(start, 1), patientId: 'p3', assigneeId: 'dr-b' }
      ]
      const scope = computeScope({
        appointments,
        freeSlots: [],
        scheduledHoursByUser: { 'dr-a': 8, 'dr-b': 4 },
        scheduledHoursTotal: 12
      })

      assert.equal(scope.total.total, 3)
      assert.equal(scope.assignees.length, 2)
      const a = scope.assignees.find(x => x.assigneeId === 'dr-a')
      assert.equal(a.metrics.total, 2)
      assert.equal(a.metrics.scheduledHours, 8)
    })

    it('groups unassigned appointments into an Einschub row', function () {
      const appointments = [
        { ...hoursApart(start, 1), patientId: 'p1', assigneeId: 'dr-a' },
        { ...hoursApart(start, 1), patientId: 'p2' }, // no assigneeId -> Einschub
        { ...hoursApart(start, 1), patientId: 'p3' } // no assigneeId -> Einschub
      ]
      const scope = computeScope({ appointments })
      const einschub = scope.assignees.find(x => x.type === 'einschub')
      assert.ok(einschub)
      assert.equal(einschub.assigneeId, null)
      assert.equal(einschub.metrics.total, 2)
      // doctors only (excludes Einschub) = 1
      assert.equal(scope.assignees.filter(x => x.assigneeId).length, 1)
    })
  })
})
