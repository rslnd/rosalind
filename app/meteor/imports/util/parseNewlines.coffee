module.exports = (text) ->
  return unless text and typeof text is 'string'
  text
    .split('\\r\\n').join('\n')
    .split('\\r').join('\n')
    .split('\\n').join('\n')
