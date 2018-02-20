import { Mongo } from 'meteor/mongo'
import helpersProfile from '../../util/helpersProfile'
import helpers from './helpers'
import actions from './actions'
import Schema from './schema'
import fields from './fields'

let Patients = new Mongo.Collection('patients')
Patients.attachSchema(Schema)
Patients.attachBehaviour('softRemovable')
Patients.helpers({ collection: () => Patients })
Patients.actions = actions({ Patients })
Patients.helpers(helpers)
Patients.helpers(helpersProfile)
Patients.fields = fields

export default Patients
