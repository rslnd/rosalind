@TestUtil =
  camelize: (string, firstLower) ->
    string = _.titleize(string)
    string = string.split(' ').join('')
    string = string.charAt(0).toLowerCase() + string.slice(1) if firstLower
    return string

  constantize: (constantName) ->
    if typeof constantName isnt 'string'
      throw new TypeError 'Constant name must be a string, was ' + typeof(constantName)

    if constantName.match(/\W|\d/)
      throw new SyntaxError 'Constant name must be a valid Javascript name'

    constant = require('api/' + @camelize(constantName, true))
    constant = constant[constantName]

    return constant

  typecast: (s) ->
    return true if s is 'true'
    return false if s is 'false'
    return parseInt(s) if s is parseInt(s).toString()
    return s

  # convert dot notation to nested object
  # example: {'profile.group': 'a'} => {profile: {group: 'a'}}
  deepen: (o) ->
    oo = {}
    for k of o
      t = oo
      parts = k.split('.')
      key = parts.pop()
      while parts.length
        part = parts.shift()
        t = t[part] = t[part] or {}
      t[key] = o[k]
    return oo

  transformAttributes: (attributes) ->
    transformedAttributes = {}
    _.each attributes, (value, key) =>
      return unless key
      key = @camelize(key, true)
      value = @typecast(value)
      transformedAttributes[key] = value

    nestedKeys = _.filter _.keys(transformedAttributes), (k) ->
      k.indexOf('.') > -1

    if nestedKeys.length > 0
      transformedAttributes = @deepen(transformedAttributes)

    return transformedAttributes
