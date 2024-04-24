import { Appointments, InboundCalls, InboundCallsTopics, Patients, Users } from '../../../api'
import moment from 'moment-timezone'
import { formatDate } from '../../../api/messages/methods/buildMessageText'
import { normalizeName } from '../../../api/patients/util/normalizeName'
import { fuzzyBirthday } from '../../../util/fuzzy/fuzzyBirthday'
import { daySelector } from '../../../util/time/day'
import sortBy from 'lodash/sortBy'
import { __ } from '../../../i18n'
import { fullNameWithTitle, lastNameWithTitle } from '../../../api/users/methods'
import quarter from '../../../util/time/quarter'

const formatDay = (s) =>
  moment.tz(s, 'Europe/Vienna').format('dd., D.M.')
const formatTime = (s) =>
  moment.tz(s, 'Europe/Vienna').format('HH:mm')

// uro11
const isReserve = ({ start }) =>
  (!!['10', '20', '40', '50'].find(m => formatTime(start).endsWith(m)))

const bookableTags = ({ start, assigneeId }) => {
  const assistanceId = "b6rEBPraMYgwmLADT"
  if ( assistanceId === assigneeId ) {
    return [
      'rR6oXAKdQBSppY4u3', // Restharnkontrolle
      'cDTyHnYJzYuiyzXfq', // Blutabnahme
      '7ywG7Njg3B2sgkaK5', // Blaseninstillation
      'XorzhDvyEPqFuNKwk' // Katheterwechsel
    ]
  } else {
    return [
      'eEgBDJuPxNFsFfAfK' // Kassenordination
    ]
  }
}

export const getBookables = () => {
  const selector = {
    type: 'bookable',
    start: { $gt: moment().endOf('minute').toDate() },
    end: { $lte: moment().add(3, 'months').toDate() },
    lockedAt: null
  }

  const fields = {
    _id: 1,
    start: 1,
    calendarId: 1,
    assigneeId: 1
  }

  const appointments = Appointments.find(selector, {
    limit: 6500, // ~60 per day for 3 months
    fields,
    sort: { start: 1 }
  }).fetch()

  const assignees = Users.find({}).fetch().reduce((acc, u) => ({ ...acc, [u._id]: u}))


  const bookables = appointments.map((a) => {
    const formattedTime = formatTime(a.start)
    const b = {
      _id: a._id,
      day: formatDay(a.start),
      time: formattedTime,
      isReserve: isReserve(a),
      tags: bookableTags(a),
      start: a.start,
      calendarId: a.calendarId,
      assigneeId: a.assigneeId,
      assigneeName: assignees[a.assigneeId] ? fullNameWithTitle(assignees[a.assigneeId]) : 'ÄrztIn',
      assigneeNameShort: assignees[a.assigneeId] ? lastNameWithTitle(assignees[a.assigneeId]) : 'ÄrztIn'
    }

    return b
  })

  return bookables
}

const string = (x) => {
  if (typeof x !== 'string') {
    throw new Error('Expected string')
  }

  return x
}

const requiredString = (x) => {
  if (string(x) && x.length === 0) {
    throw new Error(`Expected string length >0`)
  }
  return x
}

const numericString = (x) => {
  return string(x).replace(/[^0-9]/g, '')
}

const optionalString = (x) => {
  if ((string(x) && x.length === 0) || !string(x)) {
    return null
  } else {
    return string(x)
  }
}

const bool = (x) => {
  if (typeof x !== 'boolean') {
    throw new Error(`Expected boolean`)
  }
  return x
}

export const handleAppointmentBooking = (untrustedBody) => {
  const ltag = 'portal/handleAppointmentBooking'
  console.log(ltag, untrustedBody)

  if (!bool(untrustedBody.privacy)) {
    throw new Error('Privacy is requires')
  }

  const gender = optionalString(untrustedBody.gender)
  const titlePrepend = optionalString(untrustedBody.titlePrepend)
  const firstName = requiredString(untrustedBody.firstName)
  const lastName = requiredString(untrustedBody.lastName)
  const insuranceId = requiredString(numericString(untrustedBody.insuranceId))
  const birthdayString = requiredString(untrustedBody.birthday)
  const telephone = requiredString(untrustedBody.telephone)
  const wantsAppointment = bool(untrustedBody.appointment)
  const tag = optionalString(untrustedBody.tag)
  const bookableId = optionalString(untrustedBody.bookableId)

  if (insuranceId.length !== 10) {
    throw new Error(`insuranceId failed validation ${insuranceId}`)
  }

  const parsedBirthday = fuzzyBirthday(birthdayString)
  let birthday = null
  if (parsedBirthday.day && parsedBirthday.month && parsedBirthday.year) {
    birthday = parsedBirthday
  }

  const birthdaySelector = birthday ? daySelector(birthday, 'birthday') : {}
  const patientSelector = {
    insuranceId,
    lastNameNormalized: normalizeName(lastName),
    ...birthdaySelector
  }

  const patients = Patients.find(patientSelector).fetch()
  console.log(ltag, 'patientSelector', patientSelector)
  let patientId = null
  if (patients.length >= 2) {
    console.error(ltag, `warning: matched ${patients.length} patients with selector`, patientSelector)
  }

  if (patients.length === 1) {
    patientId = patients[0]._id
    console.log(ltag, 'matched one existing patient', patientId)
  } else {
    console.log(ltag, `matched ${patients.length} patients, creating new patient`, patientId)
    patientId = Patients.insert({
      titlePrepend,
      lastName,
      lastNameNormalized: normalizeName(lastName),
      firstName,
      insuranceId,
      gender,
      birthday,
      contacts: [
        {value: telephone, channel: 'Phone'}
      ],
      createdAt: new Date(),
      createdBy: null,
      createdViaPortal: true
    })
  }

  if (wantsAppointment && bookableId) {
    const bookableSelector = { _id: bookableId, type: 'bookable' }
    const existingBookable = Appointments.findOne(bookableSelector)
    if (!existingBookable) {
      throw new Error(`bookable ${bookableId} not found`)
    }

    const { _id, type, note, ...bookable } = existingBookable

    if (patientId) {
      // 2024-02-29: Max 2 bookings per quarter for same patient (any calendar or assingee)
      const allFutureAppts = Appointments.find({
        patientId,
        start: { $gte: new Date() },
        canceled: { $ne: true }
      }).fetch()

      const apptsInSameQuarter = allFutureAppts.filter(a => quarter.isSame(a.start, bookable.start))

      if (patientId && apptsInSameQuarter.length >= 2) {
        throw new Error(`sameQuarterSamePat2Appts: prevented patient from booking more than 3 appts in same quarter, patient ${patientId}`)
      }


      // 2024-02-29: Disallow when two or more no shows in past 2 years
      const pastNoShows = Appointments.find({
        patientId,
        start: {
          $lte: new Date(),
          $gte: moment().subtract(2, 'years').toDate()
        },
        canceled: { $ne: true },
        admitted: { $ne: true }
      }).fetch()

      if (pastNoShows.length >= 2) {
        throw new Error(`twoOrMoreNoShows: prevented patient from booking because of ${pastNoShows.length} no-shows in past 2 years, patient ${patientId}`)
      }


      // Prevent patient from booking multiple appts on same day (any calendar or assingee)
      const sameDaySamePatAppt = Appointments.findOne({
        patientId,
        start: {
          $gte: moment(bookable.start).startOf('day').toDate(),
          $lte: moment(bookable.start).endOf('day').toDate()
        },
        canceled: { $ne: true }
      })

      if (sameDaySamePatAppt) {
        throw new Error(`sameDaySamePatAppt: prevented patient from booking multiple appts on same day, patient ${patientId}`)
      }
    }

    Appointments.update(bookableSelector, { $set: {
      removed: true,
      removedAt: new Date(),
      note: 'Durch Online-Buchung vom System gelöscht' + ' \n' + (existingBookable.note || '')
    }})

    const appointmentId = Appointments.insert({
      ...bookable,
      tags: [tag],
      createdViaPortal: true,
      createdAt: new Date(),
      createdBy: null,
      patientId
    })

    console.log(ltag, `created appointment ${appointmentId}`)

    return {
      ok: 1,
      // appointment key is displayed on confirmation page
      appointment: {
        date: moment.tz(bookable.start, 'Europe/Vienna').format(__('time.dateFormatWeekday')),
        time: moment.tz(bookable.start, 'Europe/Vienna').format(__('time.timeFormatShort')),
        isoStart: moment.tz(bookable.start, 'Europe/Vienna').toISOString(),
        isoEnd: moment.tz(bookable.end, 'Europe/Vienna').toISOString(),
        isReserve: isReserve(bookable),
        bookableId: bookable._id
      }
    }
  } else {
    // create inbound call
    const topic = InboundCallsTopics.findOne({ contactForm: true })
    const topicId = topic ? topic._id : null

    const call = {
      firstName,
      lastName,
      telephone,
      note: 'Anfrage Termin',
      topicId,
      patientId,
      payload: {
        existingPatient: !!patientId,
        patientId,
        titlePrepend,
        birthdate,
        gender,
      },
      createdAt: new Date()
    }

    const inbouncallId = InboundCalls.insert(call)

    console.log(ltag, `created inboundCall ${inbouncallId}`)
    return { ok: 1 }
  }
}
