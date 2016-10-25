import Xdt from 'xdt'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { browserHistory } from 'react-router'

export const xdt = ({ Importers }) => {
  return new ValidatedMethod({
    name: 'importers/xdt',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      importer: { type: String, optional: true, allowedValues: [ 'xdt' ] },
      name: { type: String },
      content: { type: String }
    }).validator(),

    run ({ name, content }) {
      if (!Meteor.userId()) { return }

      const { patient } = new Xdt(content)

      if (patient) {
        console.log('[Importers] Xdt: Patient', patient)
      }

      if (Meteor.isClient) {
        browserHistory.push('/appointments')
      }
    }
  })
}
