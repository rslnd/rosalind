import _moment from 'moment-timezone'
import { extendMoment } from 'moment-range'
import identity from 'lodash/identity'
import sortBy from 'lodash/fp/sortBy'
import sum from 'lodash/sum'
import uniq from 'lodash/uniq'

const moment = extendMoment(_moment)

export const tally = ({ date, from, to, referrals, futureAppointments = [] }) => {
  const period = (from && to)
    ? ({
      start: moment(from).startOf('day').toDate(),
      end: moment(to).endOf('day').toDate()
    }) : ({
      start: moment(date).startOf('month').toDate(),
      end: moment(date).add(1, 'day').endOf('day').toDate()
    })

  const periodRange = moment.range(period.start, period.end)

  const todayPeriod = moment.range(
    moment(date).startOf('day'),
    moment(date).endOf('day')
  )

  const isWithinPeriod = d => d && periodRange.contains(d)

  const isToday = d => d && todayPeriod.contains(d)

  const futureAppointmentsCreatedToday = futureAppointments
    .filter(a => isToday(a.createdAt))

  const isPending = (r, futureAppointments) =>
    !r.redeemedAt &&
    !!futureAppointments.find(a =>
      a.patientId === r.patientId && (
        (a.calendarId === r.referredTo) ||
        (a.tags && a.tags.includes(r.referredTo))
      )
    )

  const referredInPeriod = referrals =>
    referrals.filter(r => isWithinPeriod(r.createdAt))

  const pendingInPeriod = referrals =>
    referrals.filter(r =>
      isWithinPeriod(r.createdAt) &&
      isPending(r, futureAppointments)
    )

  const redeemedInPeriod = referrals =>
    referrals.filter(r => r.redeemedAt && isWithinPeriod(r.redeemedAt))

  const referredToday = referrals =>
    referrals.filter(r => isToday(r.createdAt))

  // Appointments created today that would redeem a referral from this period
  const pendingToday = referrals =>
    referrals.filter(r =>
      isWithinPeriod(r.createdAt) &&
      isPending(r, futureAppointmentsCreatedToday)
    )

  const redeemedToday = referrals =>
    referrals.filter(r => r.redeemedAt && isToday(r.redeemedAt))

  const assigneeIds = referrals =>
    uniq(referrals.map(r => r.referredBy).filter(identity))

  const referredBy = assigneeId => referrals =>
    referrals.filter(r =>
      r.referredBy === assigneeId &&
      (
        (r.redeemedAt && isWithinPeriod(r.redeemedAt)) ||
        isWithinPeriod(r.createdAt)
      )
    )

  const count = referrals => {
    const ids = referrals.reduce((acc, curr) => ({
      ...acc,
      [curr.referredTo]: ((acc[curr.referredTo] || 0) + 1)
    }), {})

    return {
      ids,
      total: sum(Object.keys(ids).map(id => ids[id]))
    }
  }

  const subtally = referrals => ({
    referred: count(referredInPeriod(referrals)),
    pending: count(pendingInPeriod(referrals)),
    redeemed: count(redeemedInPeriod(referrals)),
    referredToday: count(referredToday(referrals)),
    pendingToday: count(pendingToday(referrals)),
    redeemedToday: count(redeemedToday(referrals))
  })

  const assignees = sortBy(a => a.redeemed.total)(
    assigneeIds(referrals).map(assigneeId => ({
      assigneeId,
      ...subtally(referredBy(assigneeId)(referrals))
    }))
  ).filter(a => !(
    a.referred.total === 0 &&
    a.pending.total === 0 &&
    a.redeemed.total === 0
  ))

  return {
    period,
    assignees,
    total: subtally(referrals)
  }
}
