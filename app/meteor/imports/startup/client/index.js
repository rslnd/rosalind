import shared from '../shared'
import polyfills from './polyfills'
import timezone from './timezone'
import development from './development'
import hotkeys from './hotkeys'
import locale from './locale'
import userStatus from './userStatus'
import livechat from './livechat'
import dataTransfer from './dataTransfer'
import native from './native'
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
  hotkeys()
  dataTransfer()
  native()
  autoLogout()
  entry()
}
