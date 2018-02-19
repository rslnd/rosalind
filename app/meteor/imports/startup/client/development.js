import React from 'react'
import { process as server } from 'meteor/clinical:env'
import * as Api from '../../api'

export default () => {
  if (server.env.NODE_ENV !== 'production') {
    window.Api = Api

    // Add ?why to the URL to blast the console when React is making unnecessary updates
    if (window.location.toString().indexOf('why') !== -1) {
      const { whyDidYouUpdate } = require('why-did-you-update')
      whyDidYouUpdate(React)
    }
  }
}
