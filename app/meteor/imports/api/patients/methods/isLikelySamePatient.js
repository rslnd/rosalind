import { isSame } from '../../../util/time/day'

export const isLikelySamePatient = (a, b) =>
  a && b &&
  a._id !== b._id &&
  (a.gender === b.gender) &&
  (a.insuranceId === b.insuranceId) &&
  (a.lastNameNormalized === b.lastNameNormalized) &&
  (a.firstName === b.firstName) &&
  a.birthday && b.birthday && isSame(a.birthday, b.birthday)
