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
    return ''
  }

  const tz = options.tz || process.env.TZ_CLIENT || 'Europe/Vienna'

  return moment
    .tz(date, tz)
    .locale(options.locale || 'de-AT')
    .format(format)
}

export const getBodyText = (templates, replacements) => {
  const { tz, locale } = templates
  const { date, ...others } = replacements

  const text = templates.text
    .replace('%day', date && formatDate(templates.dayFormat || 'dd., D.M.', date, { tz, locale }))
    .replace('%time', date && formatDate(templates.timeFormat || 'HH:mm', date, { tz, locale }))


  return Object.keys(others).reduce((text, k) => {
    return text.replace('%' + k, others[k])
  }, text)
}

export const buildMessageText = (templates = {}, replacements = {}) => {
  const text = getBodyText(templates, replacements)

  if (validateLength(text)) {
    if (validateNoRemainingPlaceholders(text)) {
      return text
    } else {
      throw new Error(`[Messages] buildMessageText: Text contains remaining placeholders`)
    }
  } else {
    const gsmInfo = gsm(text)
    const whitelistGsmInfo = {
      charset: gsmInfo.char_set,
      charsLeft: gsmInfo.chars_left,
      smsCount: gsmInfo.sms_count
    }
    throw new Error(`[Messages] buildMessageText: Text exceeds maximum length ${JSON.stringify(whitelistGsmInfo)}`)
  }
}
