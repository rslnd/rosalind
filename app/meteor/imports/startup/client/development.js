import React from 'react'
import * as Api from '../../api'

export default () => {
  window.RosalindApi = Api

  // Add #why to the URL to blast the console when React is making unnecessary updates
  if (window.location.toString().indexOf('#why') !== -1) {
    const { whyDidYouUpdate } = require('why-did-you-update')
    whyDidYouUpdate(React)
  }
}
