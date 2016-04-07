{ Meteor } = require 'meteor/meteor'
Helpers = require '/imports/util/helpers'
InboundCalls = require './collection'
Schema = require './schema'

module.exports = ->
  new Tabular.Table
    name: 'ResolvedInboundCalls'
    collection: InboundCalls
    pub: 'inboundCalls'
    columns: [
      { data: 'firstName', title: 'Vorname' }
      { data: 'lastName', title: 'Nachname' }
      { data: 'telephone', title: 'Telefon', render: (val) -> Helpers.zerofix(val) }
      { data: 'note', title: 'Notiz' }
      { data: 'privatePatient', title: 'Privat', render: (val, type, doc) -> doc.privateOrInsurance() }
      { data: 'createdAt', title: 'Angenommen', render: (val) -> moment(val).calendar() }
      { data: 'createdBy', title: 'von', render: (val) -> Helpers.getFirstName(val) }
      { data: 'removedAt', title: 'Erledigt', render: (val) -> moment(val).calendar() }
      { data: 'removedBy', title: 'von', render: (val) -> Helpers.getFirstName(val) }
      { title: '<i class="fa fa-commenting-o"></i>', tmpl: Meteor.isClient and Template.commentCount }
      { tmpl: Meteor.isClient and Template.inboundCallsUnresolve }
    ]
    order: [[5, 'desc'], [7, 'desc']]
    sub: new SubsManager()
    extraFields: Schema._firstLevelSchemaKeys
    responsive: true
    autoWidth: false
    stateSave: true
    changeSelector: (selector) ->
      selector.removed = true
      selector
