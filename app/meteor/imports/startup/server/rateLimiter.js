import { DDPRateLimiter } from 'meteor/ddp-rate-limiter'
import { isTrustedNetwork } from '../../api/customer/server/isTrustedNetwork'

export default () => {
  DDPRateLimiter.addRule({
    userId: id => !id,
    clientAddress: ip => !isTrustedNetwork(ip)
  }, 5, 1000)
}
