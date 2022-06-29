import { setChecked } from './setChecked'
import { getDue } from './getDue'

export default function ({ Checkups, CheckupsRules }) {
  return {
    setChecked: setChecked({ Checkups, CheckupsRules }),
    getDue: getDue({ Checkups, CheckupsRules })
  }
}
