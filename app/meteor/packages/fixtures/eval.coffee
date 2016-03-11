if Meteor.isServer
  Meteor.methods
    'fixtures/eval': (command) ->
      check(command, Match.Optional(String))

      if process.env.NODE_ENV isnt 'development'
        throw new Error 'Eval not allowed. Testing code somehow made it into production'

      unless Roles.userIsInRole(@userId, ['admin'])
        throw new Error 'Eval not allowed'

      console.warn("Eval by user #{@userId}: #{command}")

      evalCommand = command + ';'

      Meteor.defer ->
        try
          output = eval(evalCommand)
          console.dir(output)
        catch e
          console.error('Eval Exception: ' + e.message, e)
