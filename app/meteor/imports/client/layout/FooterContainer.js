import moment from 'moment-timezone'
import { withTracker } from 'meteor/react-meteor-data'
import { toClass } from 'recompose'
import { process as server } from 'meteor/clinical:env'
import { __ } from '../../i18n'
import { Footer } from './Footer'

const composer = (props) => {
  const update = () => {
    const customerName = server.env.CUSTOMER_NAME
    const printedStamp = __('ui.printedStamp', {
      time: moment().format(__('time.timeFormat')),
      date: moment().format(__('time.dateFormat'))
    })

    try {
      return (null, { customerName, printedStamp })
    } catch (e) {
      // ignore
    }
  }

  setInterval(update, 30 * 1000)
  return update()
}

export const FooterContainer = withTracker(composer)(toClass(Footer))
