import alerts from './alerts'
import hotkeys from './hotkeys'
import locale from './locale'
import spinner from './spinner'
import status from './status'

export default function() {
  alerts()
  locale()
  spinner()
  status()
  hotkeys()
}
