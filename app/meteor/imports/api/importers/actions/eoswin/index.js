import { patients } from './patients'

export default ({ Importers }) => {
  return Object.assign({},
    { patients: patients({ Importers }) }
  )
}
