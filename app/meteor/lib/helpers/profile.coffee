@Helpers ||= {}

Helpers.profile = (collection) ->
  collection.helpers
    firstName: ->
      if (@profile and @profile.firstName)
        @profile.firstName
      else
        @fullName()

    fullName: ->
      if (@profile and @profile.lastName and @profile.firstName)
        @profile.firstName + ' ' + @profile.lastName
      else if (@profile and @profile.lastName)
        @profile.lastName
      else if (@profile and @profile.firstName)
        @profile.firstName
      else
        @username

    fullNameWithTitle: (overrideFullName) ->
      fullName = overrideFullName or @fullName()

      if (@profile and @profile.titleAppend and @profile.titlePrepend)
        @profile.titlePrepend + ' ' + fullName
        + ', ' + @profile.titleAppend
      else if (@profile and @profile.titlePrepend)
        @profile.titlePrepend + ' ' + fullName
      else if (@profile and @profile.titleAppend)
        fullName + ', ' + @profile.titleAppend
      else
        @fullName()

    lastNameWithTitle: ->
      if (@profile and @profile.lastName)
        @fullNameWithTitle(@profile.lastName)
      else
        @fullName()
