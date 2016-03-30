module.exports = ->
  BrowserPolicy.framing.disallow()
  BrowserPolicy.content.disallowInlineScripts()
  BrowserPolicy.content.disallowEval()

  BrowserPolicy.content.allowInlineStyles()
  BrowserPolicy.content.allowStyleOrigin('https://fonts.googleapis.com')
  BrowserPolicy.content.allowFontOrigin('https://fonts.googleapis.com')
  BrowserPolicy.content.allowFontOrigin('https://fonts.gstatic.com')
