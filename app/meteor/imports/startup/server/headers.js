import { Meteor } from 'meteor/meteor'
import { WebApp } from 'meteor/webapp'

export default () => {
  Meteor.startup(() => {
    WebApp.connectHandlers.use((req, res, next) => {
      // The reverse proxy and browserPolicy should set
      // most headers, only add missing ones here
      res.setHeader('Referrer-Policy', 'no-referrer')
      res.setHeader('X-XSS-Protection', '1; mode=block')

      return next()
    })
  })
}
