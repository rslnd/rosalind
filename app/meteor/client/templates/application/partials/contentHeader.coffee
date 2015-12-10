Template.contentHeader.helpers
  titleFromRoute: ->
    key = Router.current().route.getName()
    if key.indexOf('.') < 0
      key = key + '.this'
    else
      key = key.split('.')
      key[1] = 'this' + s.capitalize(key[1])
      key = key.join('.')

    TAPi18n.__(key)
