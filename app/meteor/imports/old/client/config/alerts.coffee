Meteor.startup ->
  sAlert.config
    effect: 'stackslide'
    position: 'bottom-left'
    timeout: 5000
    html: false
    onRouteClose: false
    stack: false
    offset: 0
    beep: false
