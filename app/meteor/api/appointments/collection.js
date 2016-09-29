import { Mongo } from 'meteor/mongo'
import helpers from './helpers'
import methods from './methods'
import actions from './actions'
import Schema from './schema'

let Appointments = new Mongo.Collection('appointments')
Appointments.attachSchema(Schema)
Appointments.attachBehaviour('softRemovable')
Appointments.helpers({ collection: () => Appointments })
Appointments.helpers(helpers)
Appointments.methods = methods({ Appointments })
Appointments.actions = actions({ Appointments })

export default Appointments
