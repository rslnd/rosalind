import { Mongo } from 'meteor/mongo'
import methods from './methods'

let Settings = new Mongo.Collection('settings')
Settings.helpers({ collection: () => Settings })
Settings.methods = methods({ Settings })

// Shortcut methods
Settings.get = Settings.methods.get
Settings.set = Settings.methods.set

export default Settings
