import moment from 'moment'
import { monkey } from 'spotoninc-moment-round'

monkey(moment)

export const block = (time) => {
  const start = moment(time).floor(10, 'minutes')
  const end = start.clone().add(10, 'minutes')
  return { start, end }
}
