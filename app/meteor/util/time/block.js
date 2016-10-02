import moment from 'moment'
import 'moment-round'

export const block = (time) => {
  const start = moment(time).floor(10, 'minutes')
  const end = start.clone().add(10, 'minutes')
  return { start, end }
}
