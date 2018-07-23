import moment from 'moment-timezone'
import { withTracker } from 'meteor/react-meteor-data'
import { toClass } from 'recompose'
import { process as server } from 'meteor/clinical:env'
import { __ } from '../../i18n'
import { Footer } from './Footer'

const composer = (props) => {
  const customerName = server.env.CUSTOMER_NAME
  const printedStamp = __('ui.printedStamp', {
    time: moment().format(__('time.timeFormat')),
    date: moment().format(__('time.dateFormat'))
  })

  return { customerName, printedStamp }
}

export const FooterContainer = withTracker(composer)(toClass(Footer))
