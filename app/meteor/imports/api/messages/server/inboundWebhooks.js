import parse from 'co-body'
import { WebApp } from 'meteor/webapp'
import { receive } from './channels/sms'
import { sentry } from '../../../startup/shared/sentry'

export const inboundWebhooks = () => {
  WebApp.connectHandlers.use('/api/messages/channels/sms/receive', async (req, res, next) => {
    if (req.method !== 'POST') {
      return next()
    }

    try {
      console.log('[Messages] server/inboundWebhooks: Caught webhook', { headers: req.headers })

      const payload = await parse.json(req)
      const { response } = receive(payload, { headers: req.headers })

      res.setHeader('Content-Type', 'application/json; charset=utf8')
      res.writeHead(200)
      res.end(JSON.stringify(response))
    } catch (err) {
      console.log('[Messages] server/inboundWebhooks: Error processing webhook', err)
      sentry(err)
      res.writeHead(500)
      res.end('Error processing webhook')
    }
  })
}
