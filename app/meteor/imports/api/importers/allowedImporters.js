import includes from 'lodash/includes'

export const allowedImporters = [
  'eoswinRevenueReports',
  'eoswinJournalReports',
  'xdt',
  'genericJson'
]

export const isAllowedImporter = (slug) => {
  return includes(allowedImporters, slug)
}
