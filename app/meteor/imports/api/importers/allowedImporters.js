import includes from 'lodash/includes'

export const allowedImporters = [
  'terminiko',
  'eoswinPatients',
  'xdt',
  'genericJson',
  'mediaDocument',
  'innoPatients'
]

export const isAllowedImporter = (slug) => {
  return includes(allowedImporters, slug)
}
