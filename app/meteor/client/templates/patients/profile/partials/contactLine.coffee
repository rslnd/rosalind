Template.contactLine.helpers
  phone: ->
    @channel is 'Phone'

  email: ->
    @channel is 'Email'
