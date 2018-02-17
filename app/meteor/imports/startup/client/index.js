import polyfills from './polyfills'
import timezone from './timezone'
import development from './development'
import hotkeys from './hotkeys'
import locale from './locale'
import userStatus from './userStatus'
import livechat from './livechat'
import dataTransfer from './dataTransfer'
import nativeUpdate from './nativeUpdate'
import entry from '../../client/index'

export default function () {
  polyfills()
  timezone()
  development()
  locale()
  livechat()
  userStatus()
  hotkeys()
  dataTransfer()
  nativeUpdate()
  entry()
}
