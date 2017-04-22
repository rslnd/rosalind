import { Schedules } from 'api/schedules'

export const constraints = () => {
  return Schedules.find({
    type: 'constraint'
  })
}
