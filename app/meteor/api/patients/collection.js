import { Mongo } from 'meteor/mongo'
import helpersProfile from 'util/helpersProfile'
import helpers from './helpers'
import hooks from './hooks'
import methods from './methods'
import Schema from './schema'

let Patients = new Mongo.Collection('patients')
Patients.attachSchema(Schema)
Patients.attachBehaviour('softRemovable')
Patients.helpers({ collection: () => Patients })
Patients.methods = methods({ Patients })
Patients.helpers(helpers)
Patients.helpers(helpersProfile)
hooks(Patients)

export default Patients
