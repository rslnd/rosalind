import includes from 'lodash/includes'

export const allowedImporters = [
  'terminiko',
  'eoswinPatients',
  'eoswinReports'
]

export const isAllowedImporter = (slug) => {
  return includes(allowedImporters, slug)
}
