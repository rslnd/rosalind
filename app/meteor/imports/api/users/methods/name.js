import identity from 'lodash/identity'

export const firstName = u => u.firstName || u.lastName || u.username
export const lastName = u => u.lastName || u.firstName || u.username
export const fullName = u => [u.firstName, u.lastName].filter(identity).join(' ') || u.username
export const fullNameWithTitle = u => [u.titlePrepend, fullName(u), u.titleAppend].filter(identity).join(' ') || u.username
