import development from './development'
import alerts from './alerts'
import authentication from './authentication'
import hotkeys from './hotkeys'
import locale from './locale'
import userStatus from './userStatus'
import livechat from './livechat'
import dataTransfer from './dataTransfer'
import entry from 'client/index.jsx'

export default function () {
  development()
  authentication()
  alerts()
  locale()
  livechat()
  userStatus()
  hotkeys()
  dataTransfer()
  entry()
}
