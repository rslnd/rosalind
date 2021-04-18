import locale from './locale'
import timezone from './timezone'
import shared from '../shared'
import polyfills from './polyfills'
import development from './development'
import userStatus from './userStatus'
import native from './native'
import dataTransfer from './dataTransfer'
import autoLogout from './autoLogout'
import entry from '../../client/index'

export default function () {
  locale()
  timezone()
  polyfills()
  shared()
  development()
  userStatus()
  native()
  dataTransfer()
  autoLogout()
  entry()
}
