import './callout.tpl.jade'

Template.callout.helpers
  title: ->
    TAPi18n.__(@text + '.title')

  body: ->
    TAPi18n.__(@text + '.body')
