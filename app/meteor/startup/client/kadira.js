import { Kadira } from 'meteor/meteorhacks:kadira'

export default () => {
  Kadira.errors.addFilter(Kadira.errorFilters.filterCommonMeteorErrors)
  Kadira.errors.addFilter((errorType, message, error) => {
    console.warn('[Client] Uncaught Error', {errorType, message, error})

    if (message && (
      message.includes('been logged out by the server. Please log in again') ||
      message.includes('Server sent add for existing id'))) {
      return false
    }

    // Ignore errors thrown by Smooch
    if (!error && (
        message.includes("Cannot read property 'status' of undefined") ||
        message.includes("Cannot read property 'appUser' of undefined") ||
        message.includes("Cannot read property 'conversationUpdated' of undefined") ||
        message.includes('Not found'))) {
      return false
    }

    return true
  })
}
