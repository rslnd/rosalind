import timezone from './timezone'
import kadira from './kadira'
import development from './development'
import hotkeys from './hotkeys'
import locale from './locale'
import userStatus from './userStatus'
import livechat from './livechat'
import dataTransfer from './dataTransfer'
import nativeUpdate from './nativeUpdate'
import entry from 'client/index.jsx'

export default function () {
  timezone()
  kadira()
  development()
  locale()
  livechat()
  userStatus()
  hotkeys()
  dataTransfer()
  nativeUpdate()
  entry()
}
