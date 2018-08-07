import { Mongo } from 'meteor/mongo'
import methods from './methods'
import actions from './actions'

let Settings = new Mongo.Collection('settings')
Settings.methods = methods({ Settings })
Settings.actions = actions({ Settings })

// Shortcut methods
Settings.get = Settings.methods.get
Settings.set = Settings.methods.set

export default Settings
