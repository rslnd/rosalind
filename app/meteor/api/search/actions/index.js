import { patientsWithAppointments } from './patientsWithAppointments'
import { Patients } from 'api/patients'
import { Appointments } from 'api/appointments'

export default function () {
  return {
    patientsWithAppointments: patientsWithAppointments({ Patients, Appointments })
  }
}
