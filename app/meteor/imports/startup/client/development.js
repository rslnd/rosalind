import React from 'react'
import { process as server } from 'meteor/clinical:env'
import * as Api from '../../api'

export default () => {
  window.RosalindApi = Api

  if (server.env.NODE_ENV !== 'production') {
    // Add ?why to the URL to blast the console when React is making unnecessary updates
    if (window.location.toString().indexOf('why') !== -1) {
      const { whyDidYouUpdate } = require('why-did-you-update')
      whyDidYouUpdate(React)
    }
  }

  if (server.env.NODE_ENV === 'production') {
    console.log({
      commit: server.env.COMMIT_HASH,
      env: server.env.NODE_ENV,
      test: server.env.TEST,
      build: server.env.BUILD_NUMBER
    })
  }
}
