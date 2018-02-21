export const preload = {
  _id: 1,
  firstName: 1,
  lastName: 1,
  gender: 1
}

export const search = {
  ...preload,
  birthday: 1,
  contacts: 1,
  note: 1,
  insuranceId: 1,
  address: 1,
  titlePrepend: 1,
  titleAppend: 1,
  banned: 1
}
