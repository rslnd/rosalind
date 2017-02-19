import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Appointments } from 'api/appointments'
import { Patients } from 'api/patients'
import { Users } from 'api/users'
import { AppointmentInfo } from './AppointmentInfo'

const composer = (props, onData) => {
  const appointment = Appointments.findOne({ _id: props.appointmentId })
  const patient = Patients.findOne({ _id: appointment.patientId })
  const args = { appointmentId: props.appointmentId }

  if (appointment) {
    const assignee = Users.findOne({ _id: appointment.assigneeId })

    const handleEditNote = (newNote) => {
      Appointments.actions.editNote.call({
        ...args,
        newNote: newNote
      })
    }

    onData(null, {
      appointment,
      patient,
      assignee,
      handleEditNote
    })
  }
}

export const AppointmentInfoContainer = composeWithTracker(composer)(AppointmentInfo)
