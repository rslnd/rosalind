import polyfills from './polyfills'
import timezone from './timezone'
import kadira from './kadira'
import development from './development'
import hotkeys from './hotkeys'
import locale from './locale'
import userStatus from './userStatus'
import livechat from './livechat'
import dataTransfer from './dataTransfer'
import nativeUpdate from './nativeUpdate'
import emoji from './emoji'
import entry from '../../ui/index'

export default function () {
  polyfills()
  timezone()
  kadira()
  development()
  locale()
  livechat()
  userStatus()
  hotkeys()
  dataTransfer()
  nativeUpdate()
  emoji()
  entry()
}
