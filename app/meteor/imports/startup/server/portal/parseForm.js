import { check } from 'meteor/check'
import { Match } from 'meteor/check'

export const parseBool = (s) => s === 'on'
export const parseGender = (s) => {
  if (s === 'Male' || s === 'Female') {
    return s
  } else {
    return null
  }
}


export const optional = (v) =>
  Match.OneOf(undefined, null, v)

const argsToCheckable = (a) => {
  return Object.keys(a).reduce((acc, k) => {
    let v = a[k]

    if (
      typeof a[k] === 'object' &&
      a[k][0] && a[k][1] &&
      a[k][0] === 'optional'
    ) {
      v = optional(a[k][1])
    }
    return {...acc, [k]: v}
  }, {})
}

export const validateForm = ({ args, untrusted }) => {
  const keys = Object.keys(args)

  const typed = keys.reduce((acc, key) => {
    const type = args[key]
    const value = untrusted[key]
    let parsed = value

    if (type === Boolean || type[1] === Boolean) {
      parsed = parseBool(value)
    }

    if (key === 'gender') {
      parsed = parseGender(value)
    }

    return {
      ...acc,
      [key]: parsed
    }
  }, {})

  check(typed, argsToCheckable(args))

  return typed
}
