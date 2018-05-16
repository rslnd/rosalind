import './callout.tpl.jade'

Template.callout.helpers
  title: ->
    __(@text + '.title')

  body: ->
    __(@text + '.body')
