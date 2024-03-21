import { isSame } from '../../../util/time/day'
import idx from 'idx'

export const isLikelySamePatient = (a, b) => (
  a && b &&
  a._id !== b._id &&
  (a.gender === b.gender) &&
  (a.firstNameNormalized === b.firstNameNormalized) &&
  (a.lastNameNormalized === b.lastNameNormalized) &&
  ((a.birthday && b.birthday) ? isSame(a.birthday, b.birthday) : true) &&
  ((a.insuranceId && b.insuranceId) ? (a.insuranceId === b.insuranceId) : true) &&
  ((idx(a, _ => _.external.eoswin.id) && idx(b, _ => _.external.eoswin.id)) ? (idx(a, _ => _.external.eoswin.id) !== idx(b, _ => _.external.eoswin.id)) : true) &&
  ((idx(a, _ => _.external.inno.id) && idx(b, _ => _.external.inno.id)) ? (idx(a, _ => _.external.inno.id) !== idx(b, _ => _.external.inno.id)) : true)
)
