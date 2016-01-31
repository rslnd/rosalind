if Meteor.isServer
  Meteor.methods
    'fixtures/eval': (command) ->

      check(command, String)

      if process.env.NODE_ENV isnt 'development'
        throw new Error 'Eval not allowed. Testing code somehow made it into production'

      unless Roles.userIsInRole(@userId, ['admin'])
        throw new Error 'Eval not allowed'

      console.log("Eval by user #{@userId}: #{command}:")

      output = null
      eval('output = ' + command + ';')

      console.dir(output)
