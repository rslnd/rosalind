export const preload = {
  _id: 1,
  firstName: 1,
  lastName: 1,
  lastNameNormalized: 1,
  firstNameNormalized: 1,
  titlePrepend: 1,
  titleAppend: 1,
  insuranceId: 1,
  isPrivateInsurance: 1,
  gender: 1,
  queued: 1,
  admitted: 1,
  noShow: 1,
  canceled: 1,
  treated: 1,
  banned: 1,
  label: 1
}

export const search = {
  ...preload,
  birthday: 1,
  contacts: 1,
  note: 1,
  address: 1,
  banned: 1,
  label: 1
}
