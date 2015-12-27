Meteor.startup ->
  sAlert.config
    effect: 'stackslide'
    position: 'bottom'
    timeout: 5000
    html: false
    onRouteClose: false
    stack: false
    offset: 0
    beep: false
