{ Tags } = require 'api/tags'

Template.tags.helpers
  findTags: ->
    if @?.tags and @tags.length > 0
      Tags.find(tag: { $in: @tags })

  attr: ->
    color = if @color then @color else 'default'

    attr =
      class: 'label label-' + color

    if @description
      attr['data-toggle'] = 'tooltip'
      attr['data-placement'] = 'left'
      attr['title'] = @description

    return attr

Template.tags.onCreated ->
  $('[data-toggle="tooltip"]').tooltip()
