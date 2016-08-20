import development from './development'
import alerts from './alerts'
import hotkeys from './hotkeys'
import locale from './locale'
import userStatus from './userStatus'
import livechat from './livechat'
import dataTransfer from './dataTransfer'

export default function () {
  development()
  alerts()
  locale()
  livechat()
  userStatus()
  hotkeys()
  dataTransfer()
}
