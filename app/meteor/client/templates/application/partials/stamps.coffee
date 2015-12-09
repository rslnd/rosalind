Template.stamps.helpers
  id: ->
    'stamps' + @doc._id

  mostRecentStamp: ->
    _.chain(@fields.split(','))
      .map (field) => { field, doc: @doc }
      .filter (stamp) => @doc[stamp.field + 'By']? and @doc[stamp.field + 'At']?
      .first()
      .value()

  olderStamps: ->
    _.chain(@fields.split(','))
      .map (field) => { field, doc: @doc }
      .filter (stamp) => @doc[stamp.field + 'By']? and @doc[stamp.field + 'At']?
      .rest()
      .value()

  hasOlderStamps: ->
    _.chain(@fields.split(','))
      .map (field) => { field, doc: @doc }
      .filter (stamp) => @doc[stamp.field + 'By']? and @doc[stamp.field + 'At']?
      .rest()
      .value().length > 0
