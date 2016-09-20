import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { parseQuery } from './parseQuery'

export const search = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/search',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      query: { type: String }
    }).validator(),

    run ({ query }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const selector = parseQuery(query)

      if (selector) {
        const patients = Patients.find(selector, {
          sort: { 'profile.lastName': 1 },
          limit: 20
        }).fetch()

        return patients
      }
    }
  })
}
