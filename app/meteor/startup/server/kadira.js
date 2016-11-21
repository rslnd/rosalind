import { Kadira } from 'meteor/meteorhacks:kadira'

export default () => {
  Kadira.errors.addFilter(Kadira.errorFilters.filterCommonMeteorErrors)

  Kadira.errors.addFilter((errorType, message, error) => {
    console.warn('[Server] Uncaught Error', {errorType, message, error})

    if (message && message.includes('been logged out by the server. Please log in again')) {
      return false
    }

    return true
  })
}
