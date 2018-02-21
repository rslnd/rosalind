import { Mongo } from 'meteor/mongo'
import helpers from './helpers'
import actions from './actions'
import Schema from './schema'
import * as fields from './fields'
import methods from './methods'

let Patients = new Mongo.Collection('patients')
Patients.attachSchema(Schema)
Patients.attachBehaviour('softRemovable')
Patients.helpers({ collection: () => Patients })
Patients.actions = actions({ Patients })
Patients.helpers(helpers)
Patients.fields = fields
Patients.methods = methods

export default Patients
