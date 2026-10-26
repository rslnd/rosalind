import SimpleSchema from 'meteor/aldeed:simple-schema'
// collection2@4 is a module-based package: importing its `static` entry installs
// Mongo.Collection.prototype.attachSchema. This must run before any
// collection.js calls attachSchema().
import 'meteor/aldeed:collection2/static'

// collection2@4 dropped the aldeed:schema-index / aldeed:schema-deny plugins, so
// these schema keys are no longer recognised and would throw "is not a supported
// property". Whitelist them so the existing schema definitions keep validating.
// `index` is now a no-op in the schema itself. The indexes previously created
// from these keys by aldeed:schema-index must be ensured explicitly via
// Collection.createIndexAsync() in startup (TODO: port the 121 schema `index`
// keys). Existing databases already carry these indexes.
SimpleSchema.extendOptions([
  'index',
  'unique',
  'sparse',
  'denyInsert',
  'denyUpdate',
  'autoform',
  'decimal'
])
