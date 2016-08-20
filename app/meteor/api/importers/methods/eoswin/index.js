import { reports } from './reports'

export default ({ Importers }) => {
  return Object.assign({},
    { reports: reports({ Importers }) }
  )
}
