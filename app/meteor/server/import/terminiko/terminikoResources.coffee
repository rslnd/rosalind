@Import ||= {}
@Import.Terminiko ||= {}

@Import.Terminiko.parseResources = (job) ->

  resources = {}
  resources = parseDoctors(job, resources)
  resources = parseTags(job, resources)

  job.log('Terminiko: Parsed Resources: ' + JSON.stringify(resources))

  return resources

parseDoctors = (job, resources) ->
  Import.Mdb
    path: job.data.path
    table: 'DocRooms'
    delete: false
    iterator: (record) ->
      $set = {}

      if record.Name.match(/notfall|unangemeldet|XXX/i)?
        $set.assigneeId = null

      if record.Name.match(/privat/i)?
        $set.privateAppointment = true

      if assignee = Meteor.users.queryExactlyOne(record.Name)
        $set.assigneeId = assignee._id

      if Object.keys($set).length is 0
        job.log("Terminiko: parseDoctors: Unknown resource #{JSON.stringify(record)}")
      key = 'D' + record.Kennummer
      resources[key] = $set

  return resources


parseTags = (job, resources) ->
  Import.Mdb
    path: job.data.path
    table: 'Untersuchungen'
    delete: false
    iterator: (record) ->
      Tags.findOneOrInsert(tag: record.Kurz, description: record.Name)

      key = 'U' + record.Kennummer
      resources[key] = record.Kurz

  return resources
