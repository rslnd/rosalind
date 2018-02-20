import { TAPi18n } from 'meteor/tap:i18n'

module.exports =
  firstName: ->
    @firstName or @fullName()

  lastName: ->
    @lastName or @fullName()

  prefix: ->
    return '' if @?collection()._name is 'users'

    if @gender is 'Male'
      TAPi18n.__('patients.salutationMale') + ' '
    else if @gender is 'Female'
      TAPi18n.__('patients.salutationFemale') + ' '
    else
      ''

  fullName: (options = {}) ->
    prefix = if options.prefix isnt false then @prefix() else ''

    if (@lastName and @firstName)
      prefix + @firstName + ' ' + @lastName
    else if (@lastName)
      prefix + @lastName
    else if (@firstName)
      @firstName
    else
      @username

  fullNameWithTitle: ->
    if (@titleAppend and @titlePrepend)
      @prefix() + @titlePrepend + ' ' + @fullName({ prefix: false }) +
        ', ' + @titleAppend
    else if (@titlePrepend)
      @prefix() + @titlePrepend + ' ' + @fullName({ prefix: false })
    else if (@titleAppend)
      @prefix() + @fullName() + ', ' + @titleAppend
    else
      @fullName()

  lastNameWithTitle: ->
    if (@lastName)
      if (@titleAppend and @titlePrepend)
        @prefix() + @titlePrepend + ' ' + @lastName() +
          ', ' + @titleAppend
      else if (@titlePrepend)
        @prefix() + @titlePrepend + ' ' + @lastName()
      else if (@titleAppend)
        @prefix() + @fullName() + ', ' + @titleAppend
    else
      @fullNameWithTitle()
