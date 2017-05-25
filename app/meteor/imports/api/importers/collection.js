import { FilesCollection } from 'meteor/ostrio:files'
import actions from './actions'

let Importers = new FilesCollection({
  collectionName: 'import.files',
  allowClientCode: false,
  storagePath: '/tmp'
})

Importers.actions = actions({ Importers })

export default Importers
