Adt = Meteor.npmRequire('node_adt')

Importers.Eoswin = {}

Importers.Eoswin.Patients =
  run: (@path) ->
    Winston.info('[Import] EoswinPatients: Running')

    adt = new Adt()
    adt.open @path, 'ISO-8859-1', Meteor.bindEnvironment (err, table) ->
      return Winston.error('[Import] EoswinPatients: adb open error', err) if err

      total = table.header.recordCount
      Winston.info("[Import] EoswinPatients: Upserting #{total} patients")

      count = 0
      table.forEach Meteor.bindEnvironment (err, record) ->
        Meteor.defer ->
          return Winston.error('[Import] EoswinPatients: adb record error', err) if err
          Winston.info("[Import] EoswinPatients: Upserted #{count} patients") if ((count %% 1000) is 0)
          Winston.info("[Import] EoswinPatients: Upserted #{count} patients. Done") if (count is total)
          count += 1
