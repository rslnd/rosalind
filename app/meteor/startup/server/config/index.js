import env from './env'
import development from './development'
import accounts from './accounts'
import appcache from './appcache'
import defaultAccount from './defaultAccount'
import browserPolicy from './browserPolicy'

export default function () {
  env()
  accounts()
  appcache()
  defaultAccount()
  browserPolicy()
  development()
}
