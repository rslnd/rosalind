import { Kadira } from 'meteor/meteorhacks:kadira'

export default () => {
  Kadira.errors.addFilter(Kadira.errorFilters.filterCommonMeteorErrors)
  Kadira.errors.addFilter((errorType, message, error) => {
    console.warn('[Client] Uncaught Error', {errorType, message, error})
    return true
  })
}
