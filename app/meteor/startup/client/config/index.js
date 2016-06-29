import alerts from './alerts'
import hotkeys from './hotkeys'
import locale from './locale'
import spinner from './spinner'
import userStatus from './userStatus'

export default function () {
  alerts()
  locale()
  spinner()
  userStatus()
  hotkeys()
}
