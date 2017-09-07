import { revenueReports, journalReports } from './reports'
import { patients } from './patients'

export default ({ Importers }) => {
  return Object.assign({},
    { revenueReports: revenueReports({ Importers }) },
    { journalReports: journalReports({ Importers }) },
    { patients: patients({ Importers }) }
  )
}
