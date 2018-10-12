import moment from 'moment-timezone'
import { withTracker } from '../components/withTracker'
import { toClass } from 'recompose'
import { Meteor } from 'meteor/meteor'
import { __ } from '../../i18n'
import { Footer } from './Footer'

const composer = (props) => {
  const customerName = Meteor.settings.public.CUSTOMER_NAME
  const printedStamp = __('ui.printedStamp', {
    time: moment().format(__('time.timeFormat')),
    date: moment().format(__('time.dateFormat'))
  })

  return { customerName, printedStamp }
}

export const FooterContainer = withTracker(composer)(toClass(Footer))
