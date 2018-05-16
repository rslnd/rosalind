import moment from 'moment-timezone'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { toClass } from 'recompose'
import { process as server } from 'meteor/clinical:env'
import { __ } from '../../i18n'
import { Footer } from './Footer'

const composer = (props, onData) => {
  const update = () => {
    const customerName = server.env.CUSTOMER_NAME
    const printedStamp = __('ui.printedStamp', {
      time: moment().format(__('time.timeFormat')),
      date: moment().format(__('time.dateFormat'))
    })

    try {
      onData(null, { customerName, printedStamp })
    } catch (e) {
      // ignore
    }
  }

  update()
  const tick = setInterval(update, 30 * 1000)
  const cleanup = () => clearInterval(tick)
  return cleanup
}

export const FooterContainer = composeWithTracker(composer)(toClass(Footer))
