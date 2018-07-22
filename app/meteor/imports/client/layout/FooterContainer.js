import moment from 'moment-timezone'
import { withTracker } from 'meteor/react-meteor-data'
import { toClass } from 'recompose'
import { process as server } from 'meteor/clinical:env'
import { TAPi18n } from 'meteor/tap:i18n'
import { Footer } from './Footer'

const composer = (props) => {
  const update = () => {
    const customerName = server.env.CUSTOMER_NAME
    const printedStamp = TAPi18n.__('ui.printedStamp', {
      time: moment().format(TAPi18n.__('time.timeFormat')),
      date: moment().format(TAPi18n.__('time.dateFormat'))
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
