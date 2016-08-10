import development from './development'
import alerts from './alerts'
import hotkeys from './hotkeys'
import locale from './locale'
import userStatus from './userStatus'
import livechat from './livechat'

export default function () {
  development()
  alerts()
  locale()
  livechat()
  userStatus()
  hotkeys()
}
