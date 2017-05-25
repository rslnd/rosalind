Template.native.helpers
  settings: ->
    window.native?.settings

Template.native.events
  'click [rel="editSettings"]': ->
    window.native?.editSettings()
