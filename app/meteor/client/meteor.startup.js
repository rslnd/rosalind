console.log('[App] Startup')

FlowRouter.wait() //eslint-disable-line

// Suppress react dev tools tip
if (Meteor.settings.test) { //eslint-disable-line
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {}
}
