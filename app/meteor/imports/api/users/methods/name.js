import identity from 'lodash/identity'

// LEGACY Use fullName instead of firstName
export const firstName = u => {
  console.warn('DEPRECATED: Use fullName instead of firstName')
  return fullName(u)
}
export const lastName = u => u.lastName || u.firstName || u.username
export const fullName = u => [u.firstName, u.lastName].filter(identity).join(' ') || u.username
export const fullNameWithTitle = u => [u.titlePrepend, fullName(u), u.titleAppend].filter(identity).join(' ') || u.username

export const lastNameWithTitle = u => {
  if (u.titlePrepend) {
    return [u.titlePrepend, lastName(u), u.titleAppend].filter(identity).join(' ')
  } else {
    return fullNameWithTitle(u)
  }
}

export const shortname = u => {
  if (u.username.length <= 3) {
    return u.username
  } else {
    fullName(u).split(' ').map(word => word.charAt(0)).join('')
  }
}
