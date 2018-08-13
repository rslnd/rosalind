import shared from '../shared'
import polyfills from './polyfills'
import timezone from './timezone'
import development from './development'
import locale from './locale'
import userStatus from './userStatus'
import livechat from './livechat'
import native from './native'
import dataTransfer from './dataTransfer'
import autoLogout from './autoLogout'
import entry from '../../client/index'

export default function () {
  shared()
  polyfills()
  timezone()
  development()
  locale()
  livechat()
  userStatus()
  native()
  dataTransfer()
  autoLogout()
  entry()
}
