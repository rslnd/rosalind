import moment from 'moment-timezone'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Meteor } from 'meteor/meteor'
import { process as server } from 'meteor/clinical:env'
import { TAPi18n } from 'meteor/tap:i18n'
import { Footer } from './Footer'

const composer = (props, onData) => {
  const update = () => {
    const customerName = server.env.CUSTOMER_NAME
    const printedStamp = TAPi18n.__('ui.printedStamp', {
      time: moment().format(TAPi18n.__('time.timeFormat')),
      date: moment().format(TAPi18n.__('time.dateFormat'))
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

export const FooterContainer = composeWithTracker(composer)(Footer)
