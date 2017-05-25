import { ingest } from './ingest'
import { importWith } from './importWith'
import eoswin from './eoswin'
import { xdt } from './xdt'

export default ({ Importers }) => {
  return Object.assign({},
    { ingest: ingest({ Importers }) },
    { importWith: importWith({ Importers }) },
    { eoswin: eoswin({ Importers }) },
    { xdt: xdt({ Importers }) }
  )
}
