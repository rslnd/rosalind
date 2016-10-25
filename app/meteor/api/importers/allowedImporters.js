import includes from 'lodash/includes'

export const allowedImporters = [
  'terminiko',
  'eoswinPatients',
  'eoswinReports',
  'xdt'
]

export const isAllowedImporter = (slug) => {
  return includes(allowedImporters, slug)
}
