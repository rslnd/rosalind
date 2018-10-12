import debugging from './debugging'
import shared from '../shared'
import banner from './banner'
import intl from './intl'
import timezone from './timezone'
import env from './env'
import migrations from './migrations'
import browserPolicy from './browserPolicy'
import headers from './headers'
import livechat from './livechat'
import passwordlessLogin from './passwordlessLogin'
import appcache from './appcache'
import defaultAccount from './defaultAccount'
import rateLimiter from './rateLimiter'
import development from './development'
import api from './api'

export default function () {
  debugging()
  shared()
  banner()
  intl()
  timezone()
  env()
  migrations()
  passwordlessLogin()
  appcache()
  defaultAccount()
  browserPolicy()
  headers()
  livechat()
  rateLimiter()
  development()
  api()
}
