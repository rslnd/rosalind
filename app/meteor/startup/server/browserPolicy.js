import { BrowserPolicy } from 'meteor/browser-policy-common'

export default () => {
  BrowserPolicy.framing.disallow()
  BrowserPolicy.content.allowInlineScripts()
  BrowserPolicy.content.allowEval()
  BrowserPolicy.content.allowConnectOrigin('*')

  BrowserPolicy.content.allowInlineStyles()
  BrowserPolicy.content.allowStyleOrigin('https://fonts.googleapis.com')
  BrowserPolicy.content.allowFontOrigin('https://fonts.googleapis.com')
  BrowserPolicy.content.allowFontOrigin('https://fonts.gstatic.com')

  BrowserPolicy.content.allowScriptOrigin('https://cdn.smooch.io/')
  BrowserPolicy.content.allowScriptOrigin('https://api.smooch.io')
  BrowserPolicy.content.allowFontOrigin('https://*.bootstrapcdn.com')
  BrowserPolicy.content.allowImageOrigin('https://cdn.smooch.io/')
  BrowserPolicy.content.allowImageOrigin('https://api.smooch.io')
  BrowserPolicy.content.allowImageOrigin('https://app.smooch.io')
  BrowserPolicy.content.allowImageOrigin('https://www.gravatar.com')
  BrowserPolicy.content.allowImageOrigin('https://media.smooch.io')

  if (process.env.NODE_ENV !== 'production') {
    BrowserPolicy.content.allowScriptOrigin('http://localhost:3500')
    BrowserPolicy.content.allowFontOrigin('http://localhost:3500')
    BrowserPolicy.content.allowFontOrigin('http://*.bootstrapcdn.com')
  }
}
