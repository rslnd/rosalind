import identity from 'lodash/identity'
import sortBy from 'lodash/fp/sortBy'
import sum from 'lodash/sum'
import uniq from 'lodash/uniq'
import { startOfMonth, startOfDay, endOfDay, addDays, isWithinInterval } from 'date-fns'

export const tally = ({ date, from, to, referrals, futureAppointments = [] }) => {
  const period = (from && to)
    ? ({
      start: startOfDay(from),
      end: endOfDay(to)
    }) : ({
      start: startOfMonth(date),
      end: endOfDay(addDays(date, 1))
    })

  const todayPeriod = {
    start: startOfDay(addDays(date, 1)), // Ugh, time zones anyone?
    end: endOfDay(addDays(date, 1))
  }

  const isWithinPeriod = d => d && isWithinInterval(d, period)

  const isToday = d => d && isWithinInterval(d, todayPeriod)

  const futureAppointmentsCreatedToday = futureAppointments
    .filter(a => isToday(a.createdAt))

  const isPending = (r, futureAppointments) =>
    !r.redeemedAt &&
    !!futureAppointments.find(a =>
      a.patientId === r.patientId && (
        a.calendarId === r.referredTo ||
        a.tags && a.tags.includes(r.referredTo)
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
