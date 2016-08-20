import { FilesCollection } from 'meteor/ostrio:files'
import methods from './methods'

let Importers = new FilesCollection({
  collectionName: 'import.files',
  allowClientCode: false,
  storagePath: '/tmp'
})

Importers.methods = methods({ Importers })

export default Importers
