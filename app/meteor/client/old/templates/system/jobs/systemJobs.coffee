table = require '/imports/api/jobs/table'

Template.systemJobs.helpers
  tableImport: ->
    table() unless TabularJobCollections._tables.import
    TabularJobCollections._tables.import
