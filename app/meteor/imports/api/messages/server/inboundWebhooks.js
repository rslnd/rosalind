import { Picker } from 'meteor/meteorhacks:picker'
import bodyParser from 'body-parser'
import { receive } from '../channels/sms'

export const inboundWebhooks = () => {
  const post = Picker.filter((req, res) => req.method === 'POST')
  Picker.middleware(bodyParser.json())
  post.route('/api/messages/channels/sms/receive', (params, req, res, next) => {
    const payload = req.body

    console.log('[Messages] server/inboundWebhooks: Caught webhook', { params, headers: req.headers, body: req.body })

    res.setHeader('Content-Type', 'application/json; charset=utf8')

    try {
      const { response } = receive(payload)
      res.writeHead(200)
      res.end(JSON.stringify(response))
    } catch (err) {
      console.log('[Messages] server/inboundWebhooks: Error processing webhook', err)
      res.writeHead(500)
      res.end('Error processing webhook')
    }
  })
}
