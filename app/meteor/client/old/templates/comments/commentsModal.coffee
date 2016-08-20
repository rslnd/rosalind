inflector = require 'inflected'
{ TAPi18n } = require 'meteor/tap:i18n'
ReactComponents =
  inboundCalls: require 'client/ui/inboundCalls'

Template.commentsModal.helpers
  modalTitle: ->
    TAPi18n.__(@collection()._name + '.thisSingular')

  blazeTemplate: ->
    template = singularize(@collection()._name)
    template = template.charAt(0).toLowerCase() + template.slice(1)
    return template if Template[template]

  reactComponent: ->
    api = @collection()._name
    component = inflector.singularize(@collection()._name)
    component = inflector.singularize(@collection()._name)
    component = component.charAt(0).toUpperCase() + component.slice(1)
    component = component + 'Container'

    console.log('[Client] commentsModal rendering react component', component)

    ReactComponents[api][component]
