import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'
import { hasRole } from '../../../util/meteor/hasRole'

export const set = ({ Settings }) => {
  return new ValidatedMethod({
    name: 'settings/set',
    mixins: [CallPromiseMixin],
    validate: () => {},
    async run ({ key, value, isPublic }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!await hasRole(this.userId, ['admin', 'settings-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      await Settings.set(key, value, isPublic)

      Events.post('settings/set', { key, isPublic })
    }
  })
}
