import banner from './banner'
import intl from './intl'
import timezone from './timezone'
import env from './env'
import browserPolicy from './browserPolicy'
import passwordlessLogin from './passwordlessLogin'
import appcache from './appcache'
import defaultAccount from './defaultAccount'
import development from './development'
import api from './api'

export default function () {
  banner()
  intl()
  timezone()
  env()
  passwordlessLogin()
  appcache()
  defaultAccount()
  browserPolicy()
  development()
  api()
}
