import nc from 'namecase'

export const namecase = (a = '') => {
  if (nc.checkName(a)) {
    return nc(a)
  } else {
    return a
  }
}
