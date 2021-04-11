import { actions } from './actions'
import { Patients } from '../../'
import publication from './publication'
import resolveName from './resolveName'

export default function () {
  Patients.actions = {
    ...Patients.actions,
    ...actions({ Patients })
  }

  resolveName()
  publication()
}
