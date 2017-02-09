import gsm from 'gsm'
import moment from 'moment'
import 'moment-timezone'
import identity from 'lodash/identity'

export const validateMaxLength = (text) => {
  return (gsm(text).sms_count === 1)
}

export const formatDate = (format, date, options = {}) => {
  if (!date || !format) {
    throw new Error('Message for appointment reminder text has no date')
  }

  const tz = options.tz || process.env.TZ_CLIENT || 'Europe/Vienna'

  return moment
    .tz(date, tz)
    .locale(options.locale || 'de-AT')
    .format(format)
}

export const getBodyText = (templates, payload) => {
  const { tz, locale } = templates

  const body = templates.body
    .replace('%day', formatDate(templates.dayFormat || 'dd., D.M.', payload.start, { tz, locale }))
    .replace('%time', formatDate(templates.timeFormat || 'HH:mm', payload.start, { tz, locale }))

  const text = [body, templates.footer].filter(identity).join(' ')
  return text
}

export const getAppointmentReminderText = (templates = {}, payload) => {
  const text = getBodyText(templates, payload)

  if (validateMaxLength(text)) {
    return text
  } else {
    const gsmInfo = gsm(text)
    throw new Error(`Appointment reminder text exceeds maximum length: ${text} ${JSON.stringify(gsmInfo)}`)
  }
}
