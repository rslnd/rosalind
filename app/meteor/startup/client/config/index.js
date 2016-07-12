import alerts from './alerts'
import hotkeys from './hotkeys'
import locale from './locale'
import userStatus from './userStatus'

export default function () {
  alerts()
  locale()
  userStatus()
  hotkeys()
}
