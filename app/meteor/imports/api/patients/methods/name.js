import { __ } from '../../../i18n'

export const prefix = p => {
  switch (typeof p === 'string' ? p : (p && p.gender)) {
    case 'Female': return __('patients.salutationFemale')
    case 'Male': return __('patients.salutationMale')
    default: return ''
  }
}

export const insuranceId = p => {
  const id = typeof p === 'string' ? p : (p && p.insuranceId)
  if (!id) { return null }
  return [
    id.slice(0, 4),
    id.slice(4)
  ].join(' ')
}
