import { __ } from '../../../i18n'

export const prefix = p => {
  switch (typeof p === 'string' ? p : (p && p.gender)) {
    case 'Female': return __('patients.salutationFemale')
    case 'Male': return __('patients.salutationMale')
    default: return ''
  }
}
