import { Appointment } from '../appointment/Appointment'

export const appointments = ({ assignees, onClick }) => (
  assignees.map((assignee) => (
    assignee.appointments.map((appointment) => (
      <Appointment
        key={appointment._id}
        appointment={appointment}
        isMoving={false && this.state.moveAppointmentId === appointment._id}
        moveToAssigneeId={false && this.state.moveToAssigneeId}
        moveToTime={false && this.state.moveToTime}
        onClick={onClick} />
    ))
  ))
)
