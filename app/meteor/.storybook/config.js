import { configure } from '@kadira/storybook'

const req = require.context('../client/ui/', true, /\.story\.jsx?$/)

function loadStories () {
  require('../client/css')
  req.keys().forEach(req)
}

configure(loadStories, module)
