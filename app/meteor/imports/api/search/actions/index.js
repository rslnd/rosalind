import { patientsWithAppointments } from './patientsWithAppointments'
import { Patients } from '../../patients'
import { Appointments } from '../../appointments'

export default function () {
  return {
    patientsWithAppointments: patientsWithAppointments({ Patients, Appointments })
  }
}
