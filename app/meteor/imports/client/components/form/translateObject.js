import { __ } from '../../../i18n'

export const translateObject = (obj) => {
  let translated = {}
  Object.keys(obj).map((key) => {
    translated[key] = __(obj[key])
  })
  return translated
}
