/* global __init */
import { process as server } from 'meteor/clinical:env'

export default () => {
  if (server.env.RESEND_IO_KEY) {
    let a = document.createElement('script')
    a.src = 'https://resend.io/widget.js'
    a.async = true
    a.onload = function () {
      __init(server.env.RESEND_IO_KEY)
    }
    document.getElementsByTagName('head')[0].appendChild(a)
  }
}
