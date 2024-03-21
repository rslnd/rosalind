import { pseudonyms } from './pseudonyms'
import { startCase } from '../util/fuzzy/startCase'

const checkName = a =>
  a === a.toUpperCase() || a === a.toLowerCase()

export const namecase = (a = '') => {
  if (typeof window !== 'undefined' && window.pseudonymize) {
    return pseudonym(a)
  }

  if (checkName(a) && a.length >= 2) {
    return startCase(a)
  } else {
    return a
  }
}

const pseudonymCache = {}
const pseudonym = a => {
  if (pseudonymCache[a]) {
    return pseudonymCache[a]
  }

  pseudonymCache[a] = randomName()
  return pseudonymCache[a]
}

const randomName = () =>
  pseudonyms[Math.floor(Math.random() * (pseudonyms.length - 1))]
