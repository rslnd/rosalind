includes = require 'lodash/includes'

allowedImporters = [
  'terminiko'
  'eoswinPatients'
  'eoswinReports'
]

isAllowedImporter = (slug) ->
  includes(allowedImporters, slug)

module.exports = {
  allowedImporters,
  isAllowedImporter
}
