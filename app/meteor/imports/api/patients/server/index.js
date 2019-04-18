import publication from './publication'
import { actions } from './actions'
import { Patients } from '../../'

export default function () {
  publication()
  Patients.actions = {
    ...Patients.actions,
    ...actions({ Patients })
  }
}
