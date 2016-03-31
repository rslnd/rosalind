import accounts from './accounts'
import appcache from './appcache'
import defaultAccount from './defaultAccount'
import browserPolicy from './browserPolicy'

export default function() {
  accounts()
  appcache()
  defaultAccount()
  browserPolicy()
}
