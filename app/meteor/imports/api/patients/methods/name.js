import { TAPi18n } from 'meteor/tap:i18n'

export const prefix = p => {
  switch (p.gender) {
    case 'Female': return TAPi18n.__('patients.salutationFemale')
    case 'Male': return TAPi18n.__('patients.salutationMale')
    default: return ''
  }
}
