import development from './development'
import alerts from './alerts'
import hotkeys from './hotkeys'
import locale from './locale'
import userStatus from './userStatus'

export default function () {
  development()
  alerts()
  locale()
  userStatus()
  hotkeys()
}
