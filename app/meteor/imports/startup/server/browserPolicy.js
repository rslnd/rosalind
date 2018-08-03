import { BrowserPolicy } from 'meteor/browser-policy-common'

export default () => {
  BrowserPolicy.framing.disallow()
  BrowserPolicy.content.allowInlineScripts()
  BrowserPolicy.content.allowEval()
  BrowserPolicy.content.allowConnectOrigin('wss://*')
  BrowserPolicy.content.allowConnectOrigin('https://*')
  BrowserPolicy.content.allowOriginForAll('blob:')

  BrowserPolicy.content.allowInlineStyles()

  BrowserPolicy.content.allowScriptOrigin('https://*.smooch.io/')
  BrowserPolicy.content.allowFontOrigin('https://*.bootstrapcdn.com')
  BrowserPolicy.content.allowFontOrigin('https://*.smooch.io/')
  BrowserPolicy.content.allowImageOrigin('https://*.smooch.io/')
  BrowserPolicy.content.allowImageOrigin('https://www.gravatar.com')
  BrowserPolicy.content.allowConnectOrigin('wss://*.smooch.io')
  BrowserPolicy.content.allowConnectOrigin('https://*.smooch.io')
  BrowserPolicy.content.allowMediaOrigin('https://*.smooch.io')
  BrowserPolicy.content.allowStyleOrigin('https://*.smooch.io')

  if (process.env.NODE_ENV !== 'production') {
    BrowserPolicy.content.allowConnectOrigin('ws://*')
    BrowserPolicy.content.allowScriptOrigin('http://localhost:3500')
    BrowserPolicy.content.allowFontOrigin('http://localhost:3500')
  }
}
