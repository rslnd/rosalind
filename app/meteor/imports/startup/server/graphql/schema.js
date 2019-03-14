import gql from 'graphql-tag'

export default gql`
  scalar Date

  input DayInput {
    year: Int!
    month: Int!
    day: Int!
  }

  type Patient {
    _id: ID!
    gender: String
    titlePrepend: String
    firstName: String
    lastName: String!
    appointments: [Appointment]
  }

  type Appointment {
    _id: ID!
    start: Date!
    end: Date!
    assigneeId: String
    calendarId: String
    patientId: String
    patient: Patient
  }

  type Query {
    getAppointments(calendarId: String!, day: DayInput!): [Appointment]
  }
`
