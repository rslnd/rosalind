import { actions } from './actions'
import { Patients } from '../../'

export default function () {
  Patients.actions = {
    ...Patients.actions,
    ...actions({ Patients })
  }
}
