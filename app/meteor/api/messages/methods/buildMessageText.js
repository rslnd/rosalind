import gsm from 'gsm'
import moment from 'moment-timezone'

export const validateLength = (text) => {
  return ((gsm(text).sms_count === 1) && (text.length > 20))
}

const validateNoRemainingPlaceholders = (text) => (
  text.indexOf('%') === -1
)

export const formatDate = (format, date, options = {}) => {
  if (!date || !format) {
    throw new Error('[Messages] buildMessageText: Message has no date field')
  }

  const tz = options.tz || process.env.TZ_CLIENT || 'Europe/Vienna'

  return moment
    .tz(date, tz)
    .locale(options.locale || 'de-AT')
    .format(format)
}

export const getBodyText = (templates, { date }) => {
  const { tz, locale } = templates

  const text = templates.text
    .replace('%day', formatDate(templates.dayFormat || 'dd., D.M.', date, { tz, locale }))
    .replace('%time', formatDate(templates.timeFormat || 'HH:mm', date, { tz, locale }))

  return text
}

export const buildMessageText = (templates = {}, { date }) => {
  const text = getBodyText(templates, { date })

  if (validateLength(text)) {
    if (validateNoRemainingPlaceholders(text)) {
      return text
    } else {
      throw new Error(`[Messages] buildMessageText: Text contains remaining placeholders: "${text}"`)
    }
  } else {
    const gsmInfo = gsm(text)
    throw new Error(`[Messages] buildMessageText: Text exceeds maximum length: ${text} ${JSON.stringify(gsmInfo)}`)
  }
}
