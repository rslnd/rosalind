import { Kadira } from 'meteor/meteorhacks:kadira'

export default () => {
  Kadira.errors.addFilter(Kadira.errorFilters.filterCommonMeteorErrors)
  Kadira.errors.addFilter((errorType, message, error) => {
    console.warn('[Client] Uncaught Error', {errorType, message, error})

    // Ignore errors thrown by Smooch
    if (!error && (
        message === "Cannot read property 'status' of undefined" ||
        message === "Cannot read property 'appUser' of undefined" ||
        message === 'Not found')) {
      return false
    }

    return true
  })
}
