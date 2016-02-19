Template.tags.helpers
  findTags: ->
    if @?.tags and @tags.length > 0
      Tags.find(tag: { $in: @tags })

  attr: ->

    color = if @color then @color else 'gray'
    return {
      class: 'label label-' + color
      title: @description
      'data-toggle': 'tooltip'
    }

Template.tags.onCreated ->
  $('[data-toggle="tooltip"]').tooltip
    placement: 'left'
