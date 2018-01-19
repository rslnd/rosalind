import { TAPi18n } from 'meteor/tap:i18n'

export const translateObject = (obj) => {
  let translated = {}
  Object.keys(obj).map((key) => {
    translated[key] = TAPi18n.__(obj[key])
  })
  return translated
}
