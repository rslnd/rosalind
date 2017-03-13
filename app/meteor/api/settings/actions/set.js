import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Roles } from 'meteor/alanning:roles'
import { Events } from 'api/events'

export const set = ({ Settings }) => {
  return new ValidatedMethod({
    name: 'settings/set',
    mixins: [CallPromiseMixin],
    validate: () => {},
    run ({ key, value }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!Roles.userIsInRole(this.userId, ['admin', 'settings-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      Settings.set(key, value)

      const valueSanitized = (
          key.includes('secret') ||
          key.includes('password') ||
          key.includes('private') ||
          key.includes('key'))
        ? value.substr(0, 2) + '...' + value.substr(-1, 2)
        : value

      Events.post('settings/set', { key, value: valueSanitized })
    }
  })
}
