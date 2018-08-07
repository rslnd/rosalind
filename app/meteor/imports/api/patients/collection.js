import { Mongo } from 'meteor/mongo'
import actions from './actions'
import Schema from './schema'
import * as fields from './fields'
import methods from './methods'

let Patients = new Mongo.Collection('patients')
Patients.attachSchema(Schema)
Patients.attachBehaviour('softRemovable')
Patients.actions = actions({ Patients })
Patients.fields = fields
Patients.methods = methods

export default Patients
