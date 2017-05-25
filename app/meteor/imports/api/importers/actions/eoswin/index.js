import { reports } from './reports'
import { patients } from './patients'

export default ({ Importers }) => {
  return Object.assign({},
    { reports: reports({ Importers }) },
    { patients: patients({ Importers }) }
  )
}
