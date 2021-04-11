// HTTP API to resolve a telephone number to a plaintext patient name (for telephony)
// Set env TOKEN_PATIENTS_RESOLVE=YYYYYY to enable, then call
//   GET /api/patients/resolve_name?tel=XXXXXX&token=YYYYYY

import { Patients } from '../../'
import identity from 'lodash/identity'
import { isTrustedNetwork } from '../../customer/isTrustedNetwork'
import { normalizePhoneNumber } from '../../messages/methods/normalizePhoneNumber'

const formatName = p => [
  (p.gender === 'Female' && 'Fr.'),
  (p.gender === 'Male' && 'Hr.'),
  p.titlePrepend,
  p.lastName,
  p.firstName,
  p.titleAppend
].filter(identity).join(' ')

export default () => {
  WebApp.connectHandlers.use('/api/patients/resolve_name', async (req, res, next) => {
    if (req.method !== 'POST' && req.method !== 'GET') {
      res.writeHead(400)
      return res.end('invalid http method')
    }

    if (!req.query || !req.query.tel || !req.query.token) {
      res.writeHead(400)
      return res.end('Query parameters missing: tel, token')
    }

    if (!isTrustedNetwork(req.headers['x-forwarded-for'])) {
      res.writeHead(403)
      return res.end('Unauthorized IP')
    }

    if (!process.env.TOKEN_PATIENTS_RESOLVE || process.env.TOKEN_PATIENTS_RESOLVE !== req.query.token) {
      res.writeHead(403)
      return res.end('Unauthorized token')
    }

    const normalizedTel = normalizePhoneNumber(req.query.tel)

    if (!normalizedTel) {
      res.writeHead(400)
      return res.end('(?)')
    }

    const patient = Patients.findOne({ 'contacts.valueNormalized': normalizedTel })

    console.log('[patients] resolveName', patient ? patient._id : 'unknown')

    if (patient) {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end(formatName(patient) + '\n')
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('(Neu)\n')
    }
  })
}
