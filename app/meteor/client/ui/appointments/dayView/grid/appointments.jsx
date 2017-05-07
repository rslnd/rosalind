import { Appointment } from '../appointment/Appointment'

export const appointments = ({ assignees, onClick, isMoving, moveAppointmentId, moveToAssigneeId, moveToTime }) => (
  assignees.map((assignee) => (
    assignee.appointments.map((appointment) => (
      <Appointment
        key={appointment._id}
        appointment={appointment}
        isMoving={isMoving && moveAppointmentId === appointment._id}
        moveToAssigneeId={moveToAssigneeId}
        moveToTime={moveToTime}
        onClick={onClick} />
    ))
  ))
)
