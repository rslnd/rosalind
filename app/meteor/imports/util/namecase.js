import nc from 'namecase'
import { pseudonyms } from './pseudonyms'

const checkName = a =>
  a === a.toUpperCase() || a === a.toLowerCase()

export const namecase = (a = '') => {
  if (window.pseudonymize) {
    return pseudonym(a)
  }

  if (checkName(a)) {
    return nc(a)
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
