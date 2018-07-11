import { TAPi18n } from 'meteor/tap:i18n'
import mapValues from 'lodash/fp/mapValues'

export const translateObject = (obj) => {
  return mapValues(item => {
    if (typeof item === 'object') {
      return translateObject(item)
    }

    if (typeof item === 'string') {
      return TAPi18n.__(item)
    }

    console.error('translateObject: cannot translate', item)
  })(obj)
}
