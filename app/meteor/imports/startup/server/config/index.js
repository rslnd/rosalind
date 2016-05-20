import accounts from './accounts'
import appcache from './appcache'
import defaultAccount from './defaultAccount'
import browserPolicy from './browserPolicy'
import test from './test'

export default function() {
  test()
  accounts()
  appcache()
  defaultAccount()
  browserPolicy()
}
