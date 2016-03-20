Template.profileAddress.helpers
  showCountry: ->
    @profile?.address?.country and @profile?.address?.country isnt 'AT'
