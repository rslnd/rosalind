@Helpers ||= {}

Helpers.profile = (collection) ->
  collection.helpers
    firstName: ->
      if (@profile and @profile.firstName)
        @profile.firstName
      else
        @fullName()

    salutation: ->
      if @profile?.gender is 'Male'
        TAPi18n.__('patients.salutationMale')
      else if @profile?.gender is 'Female'
        TAPi18n.__('patients.salutationFemale')
      else
        ''

    fullName: (prefix) ->
      prefix ||= if @collection() is Patients then @salutation() + ' ' else ''

      if (@profile and @profile.lastName and @profile.firstName)
        prefix + @profile.firstName + ' ' + @profile.lastName
      else if (@profile and @profile.lastName)
        prefix + @profile.lastName
      else if (@profile and @profile.firstName)
        @profile.firstName
      else
        @username

    fullNameWithTitle: (overrideFullName) ->
      fullName = overrideFullName or @fullName('')
      prefix = if @collection() is Patients then @salutation() + ' ' else ''

      if (@profile and @profile.titleAppend and @profile.titlePrepend)
        prefix + @profile.titlePrepend + ' ' + fullName
        + ', ' + @profile.titleAppend
      else if (@profile and @profile.titlePrepend)
        prefix +  @profile.titlePrepend + ' ' + fullName
      else if (@profile and @profile.titleAppend)
        prefix + fullName + ', ' + @profile.titleAppend
      else
        @fullName()

    lastNameWithTitle: ->
      if (@profile and @profile.lastName)
        @fullNameWithTitle(@profile.lastName)
      else
        @fullName()
