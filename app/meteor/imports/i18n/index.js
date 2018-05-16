import dot from 'mongo-dot-notation'
import * as de from './de'

const translations = dot.flatten(de)['$set'] // Sorry...

export const __ = (key, substitutions) => {
  const translation = translations[key]

  if (!translation) {
    console.error('[i18n] No translation for', key)
  }

  if (substitutions && Object.keys(substitutions) !== []) {
    const search = Object.keys(substitutions)

    const replaced = search.reduce((t, s) => {
      return t.replace('__' + s + '__', substitutions[s])
    }, translation)

    return replaced
  }

  return translation
}

if (Meteor.isClient) {
  Template.registerHelper('_', __)
}
