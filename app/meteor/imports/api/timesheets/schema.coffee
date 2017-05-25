import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

module.exports = new SimpleSchema

  userId:
    type: SimpleSchema.RegEx.Id,
    index: 1

  tracking:
    type: Boolean
    index: 1

  start:
    type: Date
    index: 1

  end:
    type: Date
    index: 1
    optional: true
    custom: ->
      if shouldBeRequired = @field('tracking').value is false
        unless @operator
          return 'required' if not @isSet or @value is null or @value is ''
        else if @isSet
          return 'required' if (@operator is '$set' and @value is null) or @value is ''
          return 'required' if @operator is '$unset'
          return 'required' if @operator is '$rename'

  createdAt:
    type: Date
    autoValue: Auto.createdAt
    optional: true

  createdBy:
    type: String
    autoValue: Auto.createdBy
    optional: true
