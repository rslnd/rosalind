import { Schedules } from '../../'

export const constraints = () => {
  return Schedules.find({
    type: 'constraint'
  })
}
