import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { startOfDay, endOfDay } from 'date-fns'
import { dayToDate } from '../../../util/time/day'

export const Query = {
  getAppointments: (parent, { calendarId, day }, { api }) => {
    const date = dayToDate(day)

    return api.Appointments.find({
      calendarId,
      start: {
        $gte: startOfDay(date),
        $lte: endOfDay(date)
      }
    }, { limit: 20 }).fetch()
  }
}

export const Appointment = {
  patient: ({ patientId }, _, { api }) =>
    api.Patients.findOne({ _id: patientId })
}

export const Patient = {
  appointments: ({ _id }, _, { api }) =>
    api.Appointments.find({ patientId: _id })
}

export const Date = new GraphQLScalarType({
  name: 'Date',
  description: 'Native Date object',
  parseValue: v => new Date(v),
  serialize: v => v.getTime(),
  parseLiteral: ast => {
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10)
    }
    return null
  }
})
