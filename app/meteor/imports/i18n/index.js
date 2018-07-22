import dot from 'mongo-dot-notation'
import * as de from './de'

const translations = dot.flatten(de)['$set'] // Sorry...

export const __ = (originalKey, substitutions) => {
  const key = pluralizeKey(originalKey, substitutions)

  const translation = translations[key]

  if (!translation) {
    console.error('[i18n] No translation for', key)
    return key
  }

  return substitute(translation, substitutions) || key
}

const substitute = (translation, substitutions) => {
  if (substitutions && Object.keys(substitutions) !== []) {
    const search = Object.keys(substitutions)

    const replaced = search.reduce((t, s) => {
      return t.replace('__' + s + '__', substitutions[s])
    }, translation)

    return replaced || translation
  } else {
    return translation
  }
}

const isPlural = n => ((n >= 2) || (n <= -2) || (n === 0))

const pluralizeKey = (key, substitutions) =>
  (substitutions && isPlural(substitutions.count))
  ? `${key}_plural`
  : key

if (Meteor.isClient) {
  Template.registerHelper('_', __)
}
