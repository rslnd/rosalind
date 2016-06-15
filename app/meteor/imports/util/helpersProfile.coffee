{ TAPi18n } = require 'meteor/tap:i18n'

module.exports =
  firstName: ->
    @profile?.firstName or @fullName()

  prefix: ->
    return '' if @?collection()._name is 'users'

    if @profile?.gender is 'Male'
      TAPi18n.__('patients.salutationMale') + ' '
    else if @profile?.gender is 'Female'
      TAPi18n.__('patients.salutationFemale') + ' '
    else
      ''

  fullName: (options = {}) ->
    prefix = if options.prefix isnt false then @prefix() else ''

    if (@profile?.lastName and @profile.firstName)
      prefix + @profile.firstName + ' ' + @profile.lastName
    else if (@profile?.lastName)
      prefix + @profile.lastName
    else if (@profile?.firstName)
      @profile.firstName
    else
      @username

  fullNameWithTitle: ->
    if (@profile?.titleAppend and @profile.titlePrepend)
      @prefix() + @profile.titlePrepend + ' ' + @fullName({ prefix: false }) +
        ', ' + @profile.titleAppend
    else if (@profile?.titlePrepend)
      @prefix() + @profile.titlePrepend + ' ' + @fullName({ prefix: false })
    else if (@profile?.titleAppend)
      @prefix() + @fullName() + ', ' + @profile.titleAppend
    else
      @fullName()

  lastNameWithTitle: ->
    if (@profile?.lastName)
      @fullNameWithTitle(@profile.lastName)
    else
      @fullName()
