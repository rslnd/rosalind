import timezone from './timezone'
import kadira from './kadira'
import env from './env'
import browserPolicy from './browserPolicy'
import passwordlessLogin from './passwordlessLogin'
import appcache from './appcache'
import defaultAccount from './defaultAccount'
import development from './development'
import api from './api'

export default function () {
  timezone()
  kadira()
  env()
  passwordlessLogin()
  appcache()
  defaultAccount()
  browserPolicy()
  development()
  api()
}
