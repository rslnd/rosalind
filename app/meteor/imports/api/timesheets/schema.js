import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

module.exports = new SimpleSchema({
  userId: {
    type: SimpleSchema.RegEx.Id,
    index: 1
  },

  tracking: {
    type: Boolean,
    index: 1
  },

  start: {
    type: Date,
    index: 1
  },

  end: {
    type: Date,
    index: 1,
    optional: true,
    custom: function () {
      const shouldBeRequired = this.field('tracking').value
      if (!shouldBeRequired) {
        if (!this.operator) {
          if (!this.isSet || this.value === null || this.value === '') {
            return 'required'
          }
        } else if (this.isSet) {
          if ((this.operator === '$set' && this.value === null) || this.value === '') {
            return 'required'
          }
          if (this.operator === '$unset' || this.operator === '$rename') {
            return 'required'
          }
        }
      }
    }
  },

  createdAt: {
    type: Date,
    autoValue: Auto.createdAt,
    optional: true
  },

  createdBy: {
    type: String,
    autoValue: Auto.createdBy,
    optional: true
  }
})
