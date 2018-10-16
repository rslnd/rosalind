import nc from 'namecase'

const checkName = a =>
  a === a.toUpperCase() || a === a.toLowerCase()

export const namecase = (a = '') => {
  if (checkName(a)) {
    return nc(a)
  } else {
    return a
  }
}
