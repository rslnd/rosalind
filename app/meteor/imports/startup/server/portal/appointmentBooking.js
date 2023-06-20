import { Appointments, InboundCalls, InboundCallsTopics, Patients, Users } from '../../../api'
import moment from 'moment-timezone'
import { formatDate } from '../../../api/messages/methods/buildMessageText'
import { normalizeName } from '../../../api/patients/util/normalizeName'
import { fuzzyBirthday } from '../../../util/fuzzy/fuzzyBirthday'
import { daySelector } from '../../../util/time/day'
import chunk from 'lodash/chunk'
import { __ } from '../../../i18n'
import { fullNameWithTitle, lastNameWithTitle } from '../../../api/users/methods'

const formatDay = (s) =>
  moment.tz(s, 'Europe/Vienna').format('dd., D.M.')
const formatTime = (s) =>
  moment.tz(s, 'Europe/Vienna').format('HH:mm')

// uro11
const isReserve = ({ start }) =>
  (!!['10', '20', '40', '50'].find(m => formatTime(start).endsWith(m)))


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

  // group by days
  const bookables = appointments.reduce((acc, a, i) => {
    const formattedTime = formatTime(a.start)
    const time = {
      _id: a._id,
      time: formattedTime,
      isReserve: isReserve(a),
      calendarId: a.calendarId,
      assigneeId: a.assigneeId,
      assigneeName: fullNameWithTitle(assignees[a.assigneeId]),
      assigneeNameShort: lastNameWithTitle(assignees[a.assigneeId])
    }

    const prevA = (i >= 1) && (appointments[i - 1])

    // same day
    if (prevA && formatDay(prevA.start) === formatDay(a.start)) {
      const butlast = acc.slice(0, acc.length - 1)
      const lastDay = acc[acc.length - 1]
      return [
        ...butlast,
        {
          ...lastDay,
          times: [...lastDay.times, time]
        }
      ]
    // new day (or first day)
    } else {
      return [
        ...acc,
        {
          'day': formatDay(a.start),
          times: [time]
        }
      ]
    }
  }, [])

  const filteredBookables = bookables.map(day => {
    const maxCount = 10
    if (day.times.length > maxCount) {
      return { ...day, times: chunk(day.times, day.times.length / maxCount).map(c => c[0]) }
    } else {
      return day
    }
  })


  return filteredBookables
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
  const tag = 'portal/handleAppointmentBooking'
  console.log(tag, untrustedBody)

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
    firstName,
    lastNameNormalized: normalizeName(lastName),
    ...birthdaySelector
  }

  const patients = Patients.find(patientSelector).fetch()
  console.log(tag, 'patientSelector', patientSelector)
  let patientId = null
  if (patients.length >= 2) {
    console.error(tag, `warning: matched ${patients.length} patients with selector`, patientSelector)
  }

  if (patients.length === 1) {
    patientId = patients[0]._id
    console.log(tag, 'matched one existing patient', patientId)
  } else {
    console.log(tag, `matched ${patients.length} patients, creating new patient`, patientId)
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
    
    Appointments.update(bookableSelector, { $set: {
      removed: true,
      removedAt: new Date(),
      note: 'Durch Online-Buchung vom System gelöscht' + ' \n' + existingBookable.note
    }})

    const { _id, type, note, ...bookable } = existingBookable
    
    const appointmentId = Appointments.insert({
      ...bookable,
      createdViaPortal: true,
      createdAt: new Date(),
      createdBy: null,
      patientId
    })

    console.log(tag, `created appointment ${appointmentId}`)

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

    console.log(tag, `created inboundCall ${inbouncallId}`)
    return { ok: 1 }
  }
}
