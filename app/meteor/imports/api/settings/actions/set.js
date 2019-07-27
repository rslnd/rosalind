import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { hasRole } from '../../../util/meteor/hasRole'

export const set = ({ Settings }) => {
  return new ValidatedMethod({
    name: 'settings/set',
    mixins: [CallPromiseMixin],
    validate: () => {},
    run ({ key, value, isPublic }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!hasRole(this.userId, ['admin', 'settings-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      Settings.set(key, value, isPublic)

      Events.post('settings/set', { key, isPublic })
    }
  })
}
