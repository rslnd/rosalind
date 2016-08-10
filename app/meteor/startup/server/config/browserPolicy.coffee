module.exports = ->
  BrowserPolicy.framing.disallow()
  BrowserPolicy.content.allowInlineScripts()
  BrowserPolicy.content.allowEval()

  BrowserPolicy.content.allowInlineStyles()
  BrowserPolicy.content.allowStyleOrigin('https://fonts.googleapis.com')
  BrowserPolicy.content.allowFontOrigin('https://fonts.googleapis.com')
  BrowserPolicy.content.allowFontOrigin('https://fonts.gstatic.com')

  BrowserPolicy.content.allowStyleOrigin('blob:')
  BrowserPolicy.content.allowScriptOrigin('https://resend.io')
  BrowserPolicy.content.allowMediaOrigin('https://resend.io')
  BrowserPolicy.content.allowFontOrigin('https://resend.io')
  BrowserPolicy.content.allowImageOrigin('https://s3.amazonaws.com')


  if process.env.NODE_ENV isnt 'production'
    BrowserPolicy.content.allowScriptOrigin('http://localhost:3500')
    BrowserPolicy.content.allowFontOrigin('http://localhost:3500')
