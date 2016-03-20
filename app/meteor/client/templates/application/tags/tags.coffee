overrides = {}

Template.tags.helpers
  findTags: ->
    if @?.tags and @tags.length > 0
      Tags.find(tag: { $in: @tags })

  attr: ->

    color = if @color then @color else 'default'

    return _.defaults {
      class: 'label label-' + color
      title: @description
      'data-toggle': 'tooltip'
      'data-placement': 'left'
    }, overrides

Template.tags.onCreated ->
  overrides = @data or {}
  $('[data-toggle="tooltip"]').tooltip()
