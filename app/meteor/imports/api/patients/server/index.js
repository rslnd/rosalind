import { actions } from './actions'
import { Patients } from '../../'
import publication from './publication'

export default function () {
  Patients.actions = {
    ...Patients.actions,
    ...actions({ Patients })
  }

  publication()
}
