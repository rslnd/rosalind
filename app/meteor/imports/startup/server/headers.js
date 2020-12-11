import { Meteor } from 'meteor/meteor'
import { WebApp } from 'meteor/webapp'
import { Settings } from '../../api/settings'

const getImageFromSettings = name => {
  const setting = Settings.findOne({ key: name })
  if (!setting || !setting.base64Image) { return null }

  const str = setting.base64Image
  const b64 = str.replace(/^data:image\/.+;base64,/, '')
  const buf = new Buffer.from(b64, 'base64')
  return buf
}

export default () => {
  Meteor.startup(() => {
    WebApp.connectHandlers.use((req, res, next) => {
      // The reverse proxy and browserPolicy should set
      // most headers, only add missing ones here
      res.setHeader('Referrer-Policy', 'no-referrer')
      res.setHeader('X-XSS-Protection', '1; mode=block')

      return next()
    })

    WebApp.connectHandlers.use('/logo.svg', async (req, res, next) => {
      const image = getImageFromSettings('logo.svg')
      if (!image) { res.writeHead(404); res.end('404') }

      res.writeHead(200, {
        'Content-Length': image.length,
        'Content-Type': 'image/svg+xml'
      })

      res.end(image)
    })

    WebApp.connectHandlers.use('/favicon.ico', async (req, res, next) => {
      const image = getImageFromSettings('favicon.ico')
      if (!image) { res.writeHead(404); res.end('404') }

      res.writeHead(200, {
        'Content-Length': image.length,
        'Content-Type': 'image/x-icon'
      })

      res.end(image)
    })

  })
}
